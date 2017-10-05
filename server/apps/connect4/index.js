const express = require('express');
const router  = new express.Router();

const kTileColorMax = 2;

class Board {
    constructor() {
        this.board = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        this.lastPlacedColor = 0;
    }
}

const boards = {};

// Initialize a new board
router.get('/create_board/:name', (req, res) => {
    const name = req.params.name;

    if (name === undefined) {
        return res.json({
            ok: false,
            message: 'Could not create new board, missing parameter: name',
        });
    }

    boards[name] = new Board();

    res.json({
        ok: true,
        message: 'Created board!',
    });
});

// Returns the current state of a board
router.get('/state/:name', (req, res) => {
    const name = req.params.name;

    if (name === undefined) {
        return res.json({
            ok: false,
            message: 'Could not retrieve board information, missing parameter: name',
        });
    }

    if (!boards.hasOwnProperty(name)) {
        return res.json({
            ok: false,
            message: 'There is no board called ' + name,
        });
    }

    res.json({
        ok: true,
        message: 'Board data',
        data: boards[name],
    });
});

// Set the color of a tile
router.get('/set_color/:name/:row/:column/:color', (req, res) => {
    const name = req.params.name;
    let row = req.params.row;
    let column = req.params.column;
    let color = req.params.color;

    if (name === undefined || row === undefined || column === undefined || color === undefined) {
        return res.json({
            ok: false,
            message: 'Could not set tile color, missing parameters',
        });
    }

    if (!boards.hasOwnProperty(name)) {
        return res.json({
            ok: false,
            message: 'There is no board called ' + name,
        });
    }

    row = parseInt(row, 10);
    column = parseInt(column, 10);
    color = parseInt(color, 10);

    if (isNaN(row) || isNaN(column) || isNaN(color)) {
        return res.json({
            ok: false,
            message: 'Could not parse parameter fields as an integer',
        });
    }

    if (color === boards[name].lastPlacedColor) {
        return res.json({
            ok: false,
            message: 'You already placed your tile this round',
        });
    }

    if (row >= 8 || column >= 12) {
        return res.json({
            ok: false,
            message: 'Row and column are out of bounds',
        });
    }

    // Check if the field is already placed
    if (boards[name].board[row][column] !== 0) {
        return res.json({
            ok: false,
            message: 'Can\'t place here, tile already full',
        });
    }

    // Check that there is a tile below
    if (row !== 7 && boards[name].board[row + 1][column] === 0) {
        return res.json({
            ok: false,
            message: 'Can\'t place here, no tile below',
        });
    }

    if (color < 0 || color > kTileColorMax) {
        return res.json({
            ok: false,
            message: 'Invalid color',
        });
    }

    boards[name].board[row][column] = color;
    boards[name].lastPlacedColor = color;

    res.json({
        ok: true,
        message: 'Updated tile color',
    });
});

// Delete a board
router.get('/delete_board/:name', (req, res) => {
    const name = req.params.name;

    if (name === undefined) {
        return res.json({
            ok: false,
            message: 'Missing parameter: name',
        });
    }

    if (!boards.hasOwnProperty(name)) {
        return res.json({
            ok: false,
            message: 'There is no board called ' + name,
        });
    }

    delete boards[name];

    res.json({
        ok: true,
        message: 'Deleted board',
    });
});

router.use((req, res) => {
    res.json({
        ok: false,
        message: 'Unknown route',
        help: {
            routes: ['create_board', 'state', 'set_color', 'delete_board'],
            params: {
                create_board: ['name'],
                state: ['name'],
                set_color: ['name', 'row', 'column'],
                delete_board: ['name'],
            },
        },
    });
});

module.exports = router;
