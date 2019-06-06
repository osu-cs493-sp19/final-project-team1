const router = require('express').Router();

router.use('/businesses', require('./businesses'));
router.use('/photos', require('./photos'));
router.use('/courses', require('./courses'));
router.use('/users', require('./users'));

module.exports = router;
