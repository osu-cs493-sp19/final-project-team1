const router = require('express').Router();

router.use('/businesses', require('./businesses'));
router.use('/photos', require('./photos'));
router.use('/assignments', require('./assignments'));
module.exports = router;
