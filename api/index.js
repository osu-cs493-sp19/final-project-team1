const router = require('express').Router();

router.use('/courses', require('./courses'));
router.use('/businesses', require('./businesses'));
router.use('/photos', require('./photos'));
router.use('/assignments', require('./assignments'));
router.use('/users', require('./users'));

module.exports = router;
