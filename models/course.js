const { ObjectId } = require('mongodb');

const { getDBReference } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const CourseSchema = {
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: { required: true },
  instructorId: { required: true },
  enrollments: { required: false },
  assignments: { required: false }
}
exports.CourseSchema = CourseSchema;

exports.getCoursesPage = async function getCoursesPage(page) {
  const db = getDBReference();
  const collection = db.collection('courses');
  const count = await collection.countDocuments();

  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;


  const results = await collection.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();

  return {
    courses: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}

exports.insertNewCourse = async function insertNewCourse(course){
  course = extractValidFields(course, CourseSchema);
  const db = getDBReference();
  const collection = db.collection('courses');
  const result = await collection.insertOne(course);
  return result.insertedId;
}

exports.getCourseByID = async function getCourseByID(id){
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    // THIS NEEDS TO OMIT ENROLLMENTS AND ASSIGNMENTS -- IMPORTANT
    const results = await collection.find({ _id: new ObjectId(id) }).toArray();
    return results[0];
  }
}

exports.updateCourseByID = async function updateCourseByID(id, course){
  const db = getDBReference();
  const collection = db.collection('courses');
  if(!ObjectId.isValid(id)) {
    return null;
  } else {
    const result = await collection.replaceOne(
      { _id: new ObjectId(id) },
      course
    );
    return result.matchedCount > 0;
  }
}

exports.deleteCourseByID = async function deleteCourseByID(id){
  const db = getDBReference();
  const collection = db.collection('courses');
  if(!ObjectId.isValid(id)) {
    return null;
  } else {
    const courseResult = await collection.deleteOne(
      { _id: new ObjectId(id) }
    );

    // Add something like this later to delete the students enrolled in this class
    //
    // const enrollmentResult = await collection.deleteAll(
    //   { courseId: new ObjectId(id) }
    // );

    return courseResult.deletedCount > 0;
  }
}

exports.updateEnrollment = async function updateEnrollment(id, add, remove){
  const db = getDBReference();
  const collection = db.collection('users');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    var a = 0;
    var r = 0;

    if(add){
      const addTo = await collection.find({ _id: { $in: add }}).toArray();
      for(var i = 0; i < addTo.length; i++){
        addTo[i].enrollment.indexOf(id);
        const add = await collection.replaceOne(
          { _id: new ObjectId(addTo[i]._id) },
          addTo[i]
        );
        a = a + addTo.matchedCount;
      }
    } else {
      a = 1;
    }

    if(remove){
      const removeFrom = await collection.find({ _id: { $in: remove }}).toArray();
      for(var i = 0; i < removeFrom.length; i++){
        removeFrom[i].enrollment.splice(i,1);
        const remove = await collection.replaceOne(
          { _id: new ObjectId(removeFrom[i]._id) },
          removeFrom[i]
        );
        r = r + removeFrom.matchedCount;
      }
    } else {
      r = 1;
    }

    return (a > 0) && (r > 0);
  }
}

exports.getEnrollment = async function getEnrollment(id){
  const db = getDBReference();
  const collection = db.collection('users');
  if(!ObjectId.isValid(id)) {
    return null;
  } else {
    const enrollment = await collection.find({ "enrollment.courseID": new ObjectId(id) }).project( {_id: 1} ).toArray();
    return enrollment;
  }
}