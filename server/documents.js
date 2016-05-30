/* eslint-disable no-var */

// Dependencies
const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const multer    = require('multer');
const router    = new express.Router();

var config      = require('./config.json');
config = Object.assign(config, {
    path: path.resolve(__dirname, './resources/versionedDocuments'),
});

// Populate req.documents with a list of all files and their versions
router.use((req, res, next) => {
    fs.readdir(config.path, (err, files) => {
        if (err) res.json(err);

        // Filter out unwanted files
        files = files.filter((file) => (
            file !== '.DS_Store' &&
            file !== 'Icon?'
        ));

        files = files.map((file, index) => {
            const parts = file.split('-');
            const stats = fs.lstatSync(config.path + '/' + file);

            // Reference: http://stackoverflow.com/questions/10645994/node-js-how-to-format-a-date-string-in-utc
            const humanReadableTime = new Date(Number(parts[0]))
                .toISOString()
                .replace(/T/, ' ')
                .replace(/\..+/, '');

            return {
                filename: parts.slice(1).join('-'),
                time: parts[0],
                htime: humanReadableTime,
                size: stats.size,
            };
        });

        // Concat all versions of a document
        files = files.reduce((last, current, index) => {

            // Check if the document already exists
            var foundIndex = -1;
            last.forEach((item, index) => {
                if (item.filename === current.filename) {
                    foundIndex = index;
                }
            });

            // If it was not found, add a new entry
            if (foundIndex === -1) {
                return last.concat({
                    filename: current.filename,
                    versions: [{
                        time: current.time,
                        htime: current.htime,
                        size: current.size,
                    }],
                });
            }

            // Add to the array of versions of an existing document
            last[foundIndex].versions = last[foundIndex].versions.concat({
                time: current.time,
                size: current.size,
                htime: current.htime,
            });

            return last;
        }, []);

        req.documents = files;
        next();
    });
});

// List all files and post new ones
router.route('/')
.get((req, res) => {
    res.json(req.documents);
})
.post(multer({
    inMemory: true,
    limits: {
        fileSize: 100000000,
        files: 1,
        includeEmptyFields: true,
    },
}).fields([
    { name: 'file', maxCount: 1 },
]), (req, res) => {

    // If no file was passed, return an error
    if (!req.files['file']) {
        return res.json({
            error: 'No file uploaded!',
        });
    }

    // Get the file buffer
    var fileBuffer = new Buffer(req.files['file'][0].buffer);
    fs.writeFile(
        config.path + '/' + renameFile(req.files['file'][0].originalname),
        fileBuffer,
        (err) => {
            if (err) return res.json({
                error: 'Could not save file!',
            });

            res.json({
                message: 'File saved!',
            });
        }
    );
});

// Download the newest version of a document
router.route('/:filename')
.all((req, res, next) => {
    var foundIndex = -1;
    req.documents.forEach((file, index) => {
        if (file.filename === req.params.filename) {
            foundIndex = index;
        }
    });

    if (foundIndex > -1) {
        // I use slice because reverse() modifies the array in place
        const newestTimestamp = req.documents[foundIndex].versions.slice(0).reverse()[0].time;
        req.filepath = config.path + '/' + newestTimestamp + '-' + req.params.filename;

        next();
    } else {
        res.json({
            error: 'File not found',
        });
    }
})
.get((req, res, next) => {
    res.sendFile(req.filepath);
})
.delete((req, res, next) => {
    fs.unlink(req.filepath, (err) => {
        if (err) return res.json({
            error: 'Could not delete file!',
        });
        res.sendStatus(200);
    });
});

router.route('/:filename/:version')
.all((req, res, next) => {
    const filepath = config.path + '/' + req.params.version + '-' + req.params.filename;
    fs.lstat(filepath, (err, stats) => {
        if (err) return res.json({
            error: 'File not found.',
        });

        req.filepath = filepath;
        next();
    });
})
.get((req, res) => {
    res.sendFile(req.filepath);
})
.delete((req, res) => {
    fs.unlink(req.filepath, (err) => {
        if (err) return res.json({
            error: 'Could not delete file!',
        });
        res.sendStatus(200);
    });
});

function renameFile(filename) {

    // Basename
    filename = filename.split('/').reduce((last, current) => current);
    filename = filename.split('\\').reduce((last, current) => current);

    // Date and lowercase
    return Date.now() + '-' + filename;
}

module.exports = router;
