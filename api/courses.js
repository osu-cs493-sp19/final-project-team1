const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
    CourseSchema,
    getCoursesPage,
    insertNewCourse,
    getCourseByID,
    updateCourseByID,
    deleteCourseByID,
    updateEnrollment,
    getEnrollment,
    getCSV
} = require('../models/course');

/*
 * Route to get paginated list of Courses.
 */
router.get('/', async (req, res) => {
  try{
    const coursesPage = await getCoursesPage(parseInt(req.query) || 1);
    coursesPage.links = {};
    if (coursesPage.page < coursesPage.totalPages) {
      coursesPage.links.nextPage = `/courses?page=${coursesPage.page + 1}`;
      coursesPage.links.lastPage = `/courses?page=${coursesPage.totalPages}`;
    }
    if (coursesPage.page > 1) {
      coursesPage.links.prevPage = `/courses?page=${coursesPage.page - 1}`;
      coursesPage.links.firstPage = `/courses?page=1`;
    }
    res.status(200).send(coursesPage);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error fetching courses list.  Please try again later."
    });
  }
});

/*
 * Route to create a new course.
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, CourseSchema)) {
    try {
      const id = await insertNewCourse(req.body);
      res.status(201).send({
        id: id
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error adding Course. Try again later."
      });
    }
  } else {
    console.error(err);
    res.status(400).send({
      error: "The request body was either not present or did not contain any fields related to Course objects."
    });
  }
});

/*
 * Route to get a single course by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const course = await getCourseByID(req.params.id);
    if(course){
      res.status(200).send(course);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(404).send({
      error: "Specified Course " + req.params.id + " not found"
    });
  }
});

/*
 * Route to update a single course by ID
 */
router.put('/:id', async (req, res, next) => {
  if (validateAgainstSchema(req.body, CourseSchema)){
    try {
      const results = await updateCourseByID(req.params.id, req.body);
      if(results) {
        res.status(200).send("Success");
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        error: "Error updating Course " + req.params.id + ". Try again later."
      });
    }
  } else {
    console.error(err);
    res.status(400).send({
      error: "The request body was either not present or did not contain any fields related to Course objects."
    });
  }
});

/*
 * Route to Delete a single course by ID
 */
router.delete('/:id', async (req, res, next) =>  {
  try {
    const course = await deleteCourseByID(req.params.id);
    if(course){
      res.status(200).send("Success");
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error deleting Course " + req.params.id + ". Try again later."
    });
  }
});

/*
 * Route to Update a classes Enrollment
 */ 
router.put('/:id/students', async (req, res, next) => {
  try {
    const results = await updateEnrollment(req.params.id, req.body.add, req.body.remove);
    if(results) {
      res.status(200).send("Success");
    } else {
      res.status(500).send({
        error: "Failed to update enrollment for Course " + req.params.id
      })
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Error updating enrollment for Course " + req.params.id + ". Try again later."
    });
  }
});

/*
 * Route to get a classes Enrollment
 */
router.get('/:id/students', async (req, res, next) => {
  try {
    const results = await getEnrollment(req.params.id);
    if(results){
      res.status(200).send(results);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(404).send({
      error: "Specified Course " + req.params.id + " not found"
    });
  }
});

router.get('/:id/router', async (req, res, next) => {
  try {
    const results = await getCSV(req.params.id);
    if (results) {
      res.setHeader('Content-disposition', 'attachment; filename=enrollment.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(results);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(404).send({
      error: "Specified Course " + req.params.id + " not found"
    });
  }
});

module.exports = router;

