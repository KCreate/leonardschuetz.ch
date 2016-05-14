// Dependencies
const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const router    = new express.Router();

// Return the file for the given filename, with cache-headers
router.use((req, res, next) => {

    // Get the filename from the url
    const filename = req.path.split('/').reduce((last, current) => current, '');

    // Only apply the Cache-Control headers if the requested resource is not blacklisted
    if (!filename.match(/\.(md|json)$/gmi)) {
        res.setHeader('Cache-Control', 'public, max-age=432000');
    }

    next();
});
router.use(express.static(path.join(__dirname, 'resources')));

// Return an error message if the file was not found
router.use('/', (req, res) => {

    // Overwrite the header if express.static doesn't find anything
    res.setHeader('Cache-Control', '');

    // Check if the filename is a directory, send contents if yes
    fs.readdir(path.resolve(__dirname, 'resources/' + req.url), (err, items) => {

        // Don't throw the error
        if (err) {
            // Not a directory and not a file
            res.status(404).json({
                ok: false,
                reason: 'File not found.',
            });
        } else {

            // Response
            const response = items.filter((item) => (
                item !== '.DS_Store'
            )).map((item) => {

                // Path to the file or directory
                const filepath = path.resolve(
                    __dirname,
                    'resources/' + req.url + item
                );

                // lstatSync
                const stats = fs.lstatSync(filepath);

                // Check if the file is a directory or not
                return {
                    filename: item,
                    directory: stats.isDirectory(),
                    modified: stats.mtime,
                    size: stats.size,
                };
            });

            res.json(response);
        }
    });
});

module.exports = router;
