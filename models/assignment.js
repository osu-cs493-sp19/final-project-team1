
const { ObjectId } = require('mongodb');
const { getDBReference } = require('../lib/mongo');
const { extractValidFields, validateAgainstSchema } = require('../lib/validation');
const { getPhotosByBusinessId } = require('./photo');

/*
 * Schema describing required/optional fields of an assignment object.
 */
const AssignmentSchema = {
  courseID: { required: true },
  title: { required: true },
  points: { required: true },
  due: { required: true }
};
exports.AssignmentSchema = AssignmentSchema;


/*
 * Executes a DB query to insert a new assignment into the database.  Returns
 * a Promise that resolves to the ID of the newly-created assignment entry.
 */
async function insertNewAssignment(assignment) {
  assignment = extractValidFields(assignment, AssignmentSchema);
  const db = getDBReference();
  const collection = db.collection('assignments');
  const result = await collection.insertOne(assignment);
  return result.insertedId;
}
exports.insertNewAssignment = insertNewAssignment;

/*
 * Executes a DB query to retrieve an assignment in the database.
 */
async function getAssignmentById(id) {
  const db = getDBReference();
  const collection = db.collection('assignments');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const results = await collection
      .find({ _id: new ObjectId(id) })
      .toArray();
    return results[0];
  }
}
exports.getAssignmentById = getAssignmentById;

async function getAssignmentSubmissionsById(id) {
  /*
   * Execute queries to get all of the info about the
   * specified assignment, including its submissions.
   */
  const assignment = await getAssignmentById(id);
  if (assignment) {
    //assignment.submissions = await getSubmissionsByAssignmentId(id);
  }
  return assignment;
}
exports.getAssignmentSubmissionsById = getAssignmentSubmissionsById;


async function updateAssignmentByID(id, body){
  if(validateAgainstSchema(body, AssignmentSchema)){
    const assignment = extractValidFields(body, AssignmentSchema);
    const db = getDBReference();
    const collection = db.collection('assignments');
    console.log(assignment);
    const assignmentValues = {
      courseID: assignment.courseID,
      title: assignment.title,
      points: assignment.points,
      due: assignment.due
    }
    const result = await collection.replaceOne(
      { _id : new ObjectId(id) },
        assignmentValues 
    );
    return true;
  }else{
    return null;
  }
}
exports.updateAssignmentByID = updateAssignmentByID;
