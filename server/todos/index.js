// Dependencies
const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const router    = new express.Router();

// Check if the right password is set
router.use((req, res, next) => {
    if (req.body.password !== 'elpassworda2016') {
        return res.json({
            ok: false,
            reason: 'Not authorized',
        });
    }

    next();
});

// List all todos
router.post('/', (req, res) => {

    // Read contents of the data.json file
    fs.readFile(__dirname + '/data.json', 'utf8', (err, data) => {
        if (err) return console.log(err);

        try {
            data = JSON.parse(data);
            res.json(data);
        } catch (e) {
            res.json([]);
        }
    });
});

/* Add to the list, response should be like that:

    {
        ok: true
    }

*/
router.put('/', (req, res) => {
    fs.readFile(__dirname + '/data.json', 'utf8', (err, data) => {
        if (err) return console.log(err);

        try {
            data = JSON.parse(data);
        } catch (e) {
            return res.json({
                ok: false,
            });
        }

        data.todos[data.todos.length] = {
            text: req.body.text,
        };

        res.json({
            ok: true,
        });

        fs.writeFile(
            __dirname + '/data.json',
            JSON.stringify(data, null, 4),
            'utf8'
        );
    });
});

router.delete('/:id', (req, res) => {
    fs.readFile(__dirname + '/data.json', 'utf8', (err, data) => {
        if (err) return console.log(err);

        try {
            data = JSON.parse(data);
        } catch (e) {
            return res.json({
                ok: false,
            });
        }

        // If no id was given in the url, default to appending to the list
        var id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.json({
                ok: false,
            });
        }

        if (id >= data.todos.length || id < 0) {
            return res.json({
                ok: false,
            });
        }

        data.todos.splice(id, 1);

        res.json({
            ok: true,
        });

        fs.writeFile(
            __dirname + '/data.json',
            JSON.stringify(data, null, 4),
            'utf8'
        );
    });
});

module.exports = router;
