// Dependencies
const express   = require('express');
const router    = new express.Router();

router.use('/txt-png', require('./apps/txt-png'));

module.exports = router;
