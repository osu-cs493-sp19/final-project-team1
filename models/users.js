/*
 * User schema and data accessor methods.
 */

const {getDBReference} = require('../lib/mongo');
const {extractValidFields} = require('../lib/validation');
const bcrypt = require('bcryptjs');

/*
 * Schema describing required/optional fields of a user object.
 */
const UserSchema = {
  name: {required: true},
  email: {required: true},
  role: {required: true},
  password: {required: true}
};
exports.UserSchema = UserSchema;

/*
 * Insert a new User into the DB.
 */
async function insertNewUser(user) {
	const userToInsert = extractValidFields(user, UserSchema);
	const db = getDBReference();
	const collection = db.collection('users');
	
	const passwordHash = await bcrypt.hash(userToInsert.password, 8);
	userToInsert.password = passwordHash;
	
	const result = await collection.insertOne(userToInsert);
	
	return result.insertedId;
}
exports.insertNewUser = insertNewUser;

/*
 * Get user account data by ID. Exclude password unless 'includePassword' is true
 */
async function getUserById(id, includePassword) {
	const db = getDBReference();
	const collection = db.collection('users');
	
	if (!ObjectId.isValid(id)) {
		return null;
	} else {
		const projection = includePassword ? {} : {password: 0};
		const results = await collection
			.find({_id: new ObjectId(id)})
			.project(projection)
			.toArray();
			
		return results[0];
	}
};
exports.getUserById = getUserById;

/*
 * Get user account data by Email. Exclude password unless 'includePassword' is true
 */
async function getUserByEmail(email, includePassword) {
	const db = getDBReference();
	const collection = db.collection('users');
	
	if (!ObjectId.isValid(id)) {
		return null;
	} else {
		const projection = includePassword ? {} : {password: 0};
		const results = await collection
			.find({email: email})
			.project(projection)
			.toArray();
			
		return results[0];
	}
}
exports.getUserById = getUserById;

/*
 * Validate user with corresponding hashed 'password'
 */
async function validateUser(email, password) {
	const user = await getUserByEmail(email, true);
	const authenticated = user && await bcrypt.compare(password, user.password);
	
	return authenticated;
}
exports.validateUser = validateUser;

