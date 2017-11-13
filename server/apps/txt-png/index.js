// Dependencies
const express   = require("express");
const router    = new express.Router();
const {
    textToImageBuffer,
    imageBufferToText,
} = require("txt-png");

router.get("/", (req, res, next) => {

    if (!req.query.message) {
        return res.json({
            error: "No message was transfered!",
        });
    }

    textToImageBuffer(req.query.message, (buffer) => {
        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Disposition": "inline; filename=output.png",
        });
        res.end(buffer, "binary");
    });
});

module.exports = router;
