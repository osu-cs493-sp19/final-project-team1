const router = require('express').Router();

const { validateAgainstSchema } = require('../lib/validation');
const {
    CourseSchema,
    getCoursesPage,
    insertNewCourse
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
        error: "Error inserting business into DB.  Please try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid courses object."
    });
  }
});
module.exports = router;

