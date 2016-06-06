// Dependencies
const express   = require('express');
const router    = new express.Router();
const {
    textToImageBuffer,
    imageBufferToText,
} = require('txt-png');

router.post((req, res, next) => {

    if (!req.body.message) {
        return res.json({
            error: 'No message was transfered!',
        });
    }

    textToImageBuffer(req.body.message, (buffer) => {
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Disposition': 'inline; filename=output.png',
        });
        res.end(buffer, 'binary');
    });
});

module.exports = router;
