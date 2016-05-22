/* eslint-disable no-var */

// Dependencies
const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const router    = new express.Router();

const config = {
    path: path.resolve(__dirname, './resources/versionedDocuments/'),
};

// List all files together with all their versions
router.get('/', (req, res, next) => {
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
            const humanReadableTime = new Date()
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
                time: current.timepot,
                size: current.size,
                htime: current.htime,
            });

            return last;
        }, []);

        res.json(files);
    });
});

module.exports = router;
