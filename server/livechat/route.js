// Dependencies
const express   = require("express");
const path      = require("path");
const fs        = require("fs");
const multer    = require("multer")({
    inMemory: true,
    limits: {
        fileSize: 1000000,
        files: 1,
        includeEmptyFields: true,
    },
});
const router    = new express.Router();
const livechat  = new (require("./livechat.js"))();
const actions   = new (require("./actions.js"))();

router.ws("/", (ws, req) => {

    // Configure the livechat once the websocket opens
    if (!livechat.expressWs) {
        livechat.expressWs = req.expressWs;
    }
    if (!livechat.mountPath) {
        livechat.mountPath = "/";
    }

    // Get the websocket key from the websocket
    const websocketKey = ws.upgradeReq.headers["sec-websocket-key"];
    req.websocketKey = websocketKey;

    // Different websocket event handlers
    ws.on("message", (message) => {

        /*
            Validate the following things:
            - JSON is parseable
            - A type was set,
            - The type is valid
            - All required props were given and are of the right type
        */

        // Try to parse the message
        try {
            message = JSON.parse(message);
        } catch (e) {
            return ws.send(actions.createWebsocketInstruction("cancelRequest", {
                error: "Could not parse JSON",
            }));
        }

        // Check if a type was set
        if (!message.hasOwnProperty("type")) {
            return ws.send(actions.createWebsocketInstruction("cancelRequest", {
                error: "No type set",
            }));
        }

        // Check if the type is valid
        if (!actions.isValidAction(message.type)) {
            return ws.send(actions.createWebsocketInstruction("cancelRequest", {
                error: "Invalid action",
            }));
        }

        // Check if all required props were set
        if (!actions.hasRequiredProps(message.type, message)) {
            return ws.send(actions.createWebsocketInstruction("cancelRequest", {
                error: "Missing properties",
            }));
        }

        // At this point, we can send the instruction to the livechat
        livechat.parseInstruction(actions.createLivechatInstruction(message.type, message, {
            request: req,
            websocketKey,
            websocket: ws,
        }));

    });
    ws.on("close", (event) => {
        livechat.parseInstruction(actions.createLivechatInstruction("removeUser", {}, {
            request: req,
            websocketKey,
            websocket: ws,
        }));
    });
    ws.on("error", (event) => {
        livechat.parseInstruction(actions.createLivechatInstruction("removeUser", {}, {
            request: req,
            websocketKey,
            websocket: ws,
        }));
    });
});

// Allow a single file with a maximum size of 10 megabytes to be uploaded to the tmp directory
router.post("/", (req, res) => {
    multer.single("file")(req, res, (err) => {

        if (err) {
            return res.json({
                ok: false,
                message: err.message,
            });
        }

        // If no file was passed, return an error
        if (!req.file) {
            return res.json({
                message: "No file uploaded!",
                ok: false,
            });
        }

        // Generate a random filename
        const filename = Date.now() + "_" + req.file.originalname;

        // Filepath for temporary files
        const savePath = path.resolve(__dirname, "./tmp/" + filename);

        // Save the file
        const fileBuffer = new Buffer(req.file.buffer);

        // Save the file
        fs.writeFile(savePath, fileBuffer, (err) => {
            if (err) return res.json({
                message: "Could not save file!",
                ok: false,
            });

            res.json({
                message: "Saved file!",
                link: "/livechatapi/tmp/" + filename,
                ok: true,
            });
        });
    });
});

// Serve plain text files from the tmp directory
router.use("/tmp", (req, res, next) => {
    res.set("Content-Type", "text/plain");
    next();
}, express.static(path.resolve(__dirname, "./tmp/")));

// If express.static didn't find anything, reset the content-type
router.use("/tmp", (req, res, next) => {
    res.removeHeader("Content-Type");
    next();
});

module.exports = router;
