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
    .project({ enrollments: 0, assignments: 0 })
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
    const results = await collection.find({ _id: new ObjectId(id) }).project().toArray();
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

exports.updateEnrollment = async function updateEnrollment(id, toAdd, toRemove){
  const db = getDBReference();
  const collection = db.collection('courses');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const course = await collection.find({ _id: new ObjectId(id) }).toArray();
    
    console.log("BEFORE --- \n" + course[0]);

    // Add enrollments
    if(toAdd){
      for(var i = 0; i < toAdd.length; i++){
        if(course[0].enrollments.indexOf(toAdd[i]) === -1){
          course[0].enrollments.push(toAdd[i]);
        }
      }
    }

    console.log("ADDED --- \n" + course[0]);

    // Remove enrollments
    if(toRemove){
      for(var i = 0; i < toRemove.length; i++){
        if(!(course[0].enrollments.indexOf(toRemove[i]) === -1)){
          course[0].enrollments.splice(i,0);
          i--;
          console.log("I: " + i);
        }
      }
    }

    console.log("REMOVED --- \n" + course[0]);


    const result = await collection.replaceOne(
      { _id: new ObjectId(id) },
      course[0]
    );
    return result.matchedCount > 0;
  }
}

exports.getEnrollment = async function getEnrollment(id){
  const db = getDBReference();
  const collection = db.collection('enrollment');
  if(!ObjectId.isValid(id)) {
    return null;
  } else {
    const enrollment = await collection.find({ courseID: new ObjectId(id) }).toArray();
    return enrollment;
  }
}