// Dependencies
const express   = require("express");
const router    = new express.Router();

router.use("/txt-png", require("./apps/txt-png"));
router.use("/connect4", require("./apps/connect4"));

module.exports = router;
