const express = require('express');
const router  = new express.Router();

const kTileColorMax = 2;
const kTileColorEmpty = 0;
const kTileColorPrimary = 1;
const kTileColorSecondary = 2;

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

        this.lastPlacedColor = kTileColorSecondary;
        this.lastPlacedColumn = -1;
    }

    checkWin() {

        // Check each color
        for (let color = kTileColorPrimary; color < kTileColorSecondary + 1; color++) {

            // Check all vertical combinations
            for (let vy = 0; vy < 5; vy++) {
                for (let vx = 0; vx < 12; vx++) {
                    if (
                        this.board[vy + 0][vx] === color &&
                        this.board[vy + 1][vx] === color &&
                        this.board[vy + 2][vx] === color &&
                        this.board[vy + 3][vx] === color) {
                        return color;
                    }
                }
            }

            // Check horicontal combinations
            for (let hy = 0; hy < 8; hy++) {
                for (let hx = 0; hx < 9; hx++) {
                    if (
                        this.board[hy][hx + 0] === color &&
                        this.board[hy][hx + 1] === color &&
                        this.board[hy][hx + 2] === color &&
                        this.board[hy][hx + 3] === color) {
                        return color;
                    }
                }
            }

            // Check diagonal combinations
            for (let dy = 0; dy < 5; dy++) {
                for (let dx = 0; dx < 9; dx++) {
                    if (
                        this.board[dy + 0][dx + 3] === color &&
                        this.board[dy + 1][dx + 2] === color &&
                        this.board[dy + 2][dx + 1] === color &&
                        this.board[dy + 3][dx + 0] === color) {
                        return color;
                    }

                    if (
                        this.board[dy + 0][dx + 0] === color &&
                        this.board[dy + 1][dx + 1] === color &&
                        this.board[dy + 2][dx + 2] === color &&
                        this.board[dy + 3][dx + 3] === color) {
                        return color;
                    }
                }
            }
        }

        return 0;
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
        won: boards[name].checkWin(),
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

    // Check if someone has won the game already
    const boardWinCheck = boards[name].checkWin();
    if (boardWinCheck !== 0) {
        return res.json({
            ok: false,
            message: 'Player number #' + boardWinCheck + ' has already won the game!',
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
    boards[name].lastPlacedColumn = column;

    res.json({
        ok: true,
        message: 'Updated tile color',
        won: boards[name].checkWin(),
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
