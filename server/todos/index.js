// Dependencies
const express   = require('express');
const path      = require('path');
const fs        = require('fs');
const config    = require('./../config.json');
const router    = new express.Router();

// List all todos
router.get('/', (req, res) => {
    fs.readFile(__dirname + '/data.json', 'utf8', (err, data) => {
        if (err) return console.log(err);

        try {
            data = JSON.parse(data);
            res.json(data);
        } catch (e) {
            res.json({
                todos: [],
            });
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

        if (!req.body.text || req.body.text === '') {
            return res.json({
                ok: false,
            });
        }

        if (req.body.text.length > 200) {
            return res.json({
                ok: false,
            });
        }

        data.todos[data.todos.length] = {
            text: req.body.text,
            isLink: req.body.isLink,
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
        const id = parseInt(req.params.id, 10);
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
