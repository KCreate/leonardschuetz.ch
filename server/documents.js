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

// Populate the req.files with a list of all files and their versions
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

// List all files together with all their versions
router.get('/', (req, res, next) => {
    res.json(req.documents);
});

// Download the newest version of a document
router.get('/:filename', (req, res) => {

    var foundIndex = -1;
    req.documents.forEach((file, index) => {
        if (file.filename === req.params.filename) {
            foundIndex = index;
        }
    });

    // If the file exists
    if (foundIndex > -1) {

        // Get the newest timestamp of the file
        const newestTimestamp = req.documents[foundIndex].versions.reverse()[0].time; // hacky
        const filepath = config.path + '/' + newestTimestamp + '-' + req.params.filename;

        // Check if the file really exists
        fs.lstat(filepath, (err, stats) => {

            // If the file was not found
            if (err) return res.json({
                error: 'File not found.',
            });

            res.sendFile(filepath);
        });

    } else {
        res.json({
            error: 'File not found.',
        });
    }
});

// Download a specific document
router.get('/:filename/:version', (req, res) => {

    const filepath = config.path + '/' + req.params.version + '-' + req.params.filename;
    fs.lstat(filepath, (err, stats) => {

        // If the file was not found
        if (err) return res.json({
            error: 'File not found.',
        });

        res.sendFile(filepath);
    });
});

// Upload new documents to the server
router.post('/', multer({
    inMemory: true,
    limits: {
        fileSize: 100000000,
        files: 1,
        includeEmptyFields: true,
    },
}).fields([
    { name: 'file', maxCount: 1 },
]), (req, res) => {

    // Check if the password is correct
    if (req.body.password !== config.password) {
        return res.json({
            error: 'Incorrect password',
        });
    }

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

function renameFile(filename) {

    // Basename
    filename = filename.split('/').reduce((last, current) => current);
    filename = filename.split('\\').reduce((last, current) => current);

    // Date and lowercase
    return Date.now() + '-' + filename;
}

module.exports = router;
