const router = require('express').Router();
const {validateAgainstSchema} = require('../lib/validation');
const {generateAuthToken, requireAuthentication} = require('../lib/auth');
const {UserSchema, insertNewUser, getUserById, validateUser} = require('../models/users');

/*
 * Route to create new user account
 */
router.post('/', async (req, res) => {
	if(validateAgainstSchema(req.body, UserSchema)){
		if(req.body.role == "admin" || req.body.role == "instructor"){                                   // check authorization token and add 'role' field to request
			requireAuthentication(req, res);
		}
		if(req.role == "admin" || (req.body.role != "admin" && req.body.role != "instructor")){          // allow post if token supplies admin role, or if post body doesn't require admin/instructor
			try {
				const id = await insertNewUser(req.body);
				res.status(201).send({
					id: id
				});
			}catch(err){
				res.status(500).send({
					error: "Error inserting user into DB.  Please try again later."
				});
			}
		}else{
			res.status(403).send({
				error: "Unauthorized."
			});
		}
	}else{
		res.status(400).send({
			error: "Request body does not contain a valid user."
		});
	}	
});

/*
 * Route to login with a user's credentials.
 */
router.post('/login', async (req, res) => {
	if (req.body && req.body.email && req.body.password) {
		try {
			const userid = await validateUser(req.body.email, req.body.password);
			
			if (userid) {
				const user = await getUserById(userid, 0);
				const token = generateAuthToken(userid, user.role);
				
				res.status(200).send({ token: token });
			} else {
				res.status(401).send({
					error: "Invalid authentication credentials"
				});
			}
		} catch (err) {
			res.status(500).send({
				error: "Error logging in.  Try again later."
			});
		}
	} else {
		res.status(400).json({
			error: "Request body needs user email and password."
		});
	}
});

 
/*
 * Route to fetch info about a specific user.
 */
router.get('/:id', requireAuthentication, async (req, res, next) => {
	if (req.user == req.params.id || req.isAdmin) {
		try {
			const user = await getUserById(req.params.id, 0);
			if (user) {
				res.status(200).send(user);
			} else {
				next();
			}
		} catch (err) {
			res.status(500).send({
				error: "Unable to fetch user.  Please try again later."
			});
		}
	} else {
		res.status(403).send({
			error: "Unauthorized."
		});
	}
});

module.exports = router;
