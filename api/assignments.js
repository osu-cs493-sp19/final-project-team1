/*
 * API sub-router for assignments collection endpoints.
 */

const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
  AssignmentSchema,
  getAssignmentById,
  insertNewAssignment,
  updateAssignmentByID,
  getAssignmentDetailsById
} = require('../models/assignment');

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
      console.log(assignment);
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
    try {
      const id = await updateAssignmentByID(parseInt(req.params.id), req.body);
      res.status(200).send({id: "Success"});
    } catch (err) {
      console.error(" -- Error:", err);
      res.status(400).send({
        error: "The request body was either not present or did not contain any fields related to Assignment objects."
      });
    }
  });

module.exports = router;
