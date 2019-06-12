/*
 * API sub-router for assignments collection endpoints.
 */

const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const { validateAgainstSchema } = require('../lib/validation');
const {
  AssignmentSchema,
  getAssignmentById,
  insertNewAssignment,
  updateAssignmentById,
  deleteAssignmentById,
} = require('../models/assignment');
const {
  insertNewSubmission,
  removeUploadedFile,
  getPagedAssignmentSubmissions,
  getDownloadStreamByFilename,
  removeAllSubmissions
} = require('../models/submission');

const upload = multer({
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      console.log("file:" + JSON.stringify(file));
      const basename = crypto.pseudoRandomBytes(16).toString('hex');
      const extension = file.originalname.substr(file.originalname.lastIndexOf('.') + 1);
      callback(null, `${basename}.${extension}`);
    }
  })
});

/*
 * Route to create a new assignment.
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    try {
      const id = await insertNewAssignment(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error inserting assignment into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "The request body was either not present or did not contain a valid Assignment object."
    });
  }
});


/*
 * Route to fetch info about a specific assignment.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await getAssignmentById(req.params.id);
    if (assignment) {
      res.status(200).send(assignment);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(404).send({
      error: "Specified Assignment "+req.params.id+" not found."
    });
  }
});



/*
 * Route to update a specific assignment.
 */
router.put('/:id', async (req, res, next) => {
  if(validateAgainstSchema(req.body, AssignmentSchema)){
    try {
      const id = await updateAssignmentById(req.params.id, req.body);
      if(id != null){
        res.status(200).send({success: "Assignment: "+id+" updated"});
      }else{
        res.status(404).send({
          error: "Specified Assignment "+req.params.id+" not found."
        });
      }
    } catch (err) {
      console.error(" -- Error:", err);
      res.status(404).send({
        error: "Specified Assignment "+req.params.id+" not found."
      });
    }
  }else{
    res.status(403).send({
      error: "The request body was either not present or did not contain any fields related to Assignment objects."
    });
  }
});

/*
 * Route to delete a specific assignment.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    if(await getAssignmentById(req.params.id) != null){
      const subs = await removeAllSubmissions(req.params.id);
      const id = await deleteAssignmentById(req.params.id);
      res.status(204).end();
    }else{
      res.status(404).send({
        error: "Specified Assignment "+req.params.id+" not found"
      });
    }
  } catch (err) {
    console.error(" -- Error:", err);
    res.status(404).send({
      error: "Specified Assignment "+req.params.id+" not found"
    });
  }
});






/*

***************************** SUBMISSION RELATED ROUTES BELOW

*/

/*
 * Route to create a new submission.
 */


router.post('/:id/submissions', upload.single('submission'), async (req, res) => {
    try {
      const date = new Date();
      date.toISOString();
      const submission = {
        path: req.file.path,
        filename: req.file.filename,
        contentType: req.file.mimetype,
        assignmentId: req.params.id,
        //studentId needs to not be req.body.studentId, it needs to be the Id of the student that is logged in
        //so req.user ??
        studentId: req.body.studentId,
        timestamp: date
      };
      const id = await insertNewSubmission(submission);
      if(id == null){
        res.status(404).send({
          error: "Specified Assignment "+req.params.id+" not found."
        });
      }else{
        await removeUploadedFile(req.file);
        res.status(201).send({
          id: id,
        });
      }
    } catch (err) {
      console.error(err);
      res.status(404).send({
        error: "Specified Assignment "+req.params.id+" not found."
      });
    }
});

/*
 * Route to get paginated submissions for an assignment.
 */
router.get('/:id/submissions', async (req, res, next) => {
    try {
      const submission = await getPagedAssignmentSubmissions(req.params.id, parseInt(req.query.page));
      if(!submission.length == 0){
        res.status(201).send({
          submissions: submission
        });
      }else{
        res.status(404).send({
          error: "Specified Assignment "+req.params.id+" not found."
        });
      }
    } catch (err) {
      console.error(err);
      res.status(404).send({
        error: "Specified Assignment "+req.params.id+" not found."
      });
    }
});

/*
 * Route to view / download submission.
 */
router.get('/files/:filename', (req, res, next) => {
  getDownloadStreamByFilename(req.params.filename)
    .on('error', (err) => {
      if (err.code === 'ENOENT') {
        next();
      } else {
        next(err);
      }
    })
    .on('file', (file) => {
      res.status(200).type(file.metadata.contentType);
    })
    .pipe(res);
});

module.exports = router;
