const express = require('express');
const router  = new express.Router();

const kTileColorMax = 2

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
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
  }
}

const boards = {}

// Initialize a new board
router.get('/create_board/:name', (req, res) => {
  const name = req.params.name

  if (name == undefined) {
    return res.json({
      ok: false,
      message: "Could not create new board, missing parameter: name"
    })
  }

  boards[name] = new Board()

  res.json({
    ok: true,
    message: "Created board!"
  })
})

// Returns the current state of a board
router.get('/state/:name', (req, res) => {
  const name = req.params.name

  if (name == undefined) {
    return res.json({
      ok: false,
      message: "Could not retrieve board information, missing parameter: name"
    })
  }

  if (!boards.hasOwnProperty(name)) {
    return res.json({
      ok: false,
      message: "There is no board called " + name
    })
  }

  res.json({
    ok: true,
    message: "Board data",
    data: boards[name]
  })
})

// Toggle the color of a tile
router.get('/toggle_tile/:name/:row/:column', (req, res) => {
  const name = req.params.name
  let row = req.params.row
  let column = req.params.column

  if (name == undefined || row == undefined || column == undefined) {
    return res.json({
      ok: false,
      message: "Could not toggle tile, missing parameters: name or row or column"
    })
  }

  if (!boards.hasOwnProperty(name)) {
    return res.json({
      ok: false,
      message: "There is no board called " + name
    })
  }

  row = parseInt(row)
  column = parseInt(column)

  if (isNaN(row) || isNaN(column)) {
    return res.json({
      ok: false,
      message: "Could not parse row and column field as an integer"
    })
  }

  if (row >= 8 || column >= 12) {
    return res.json({
      ok: false,
      message: "Row and column are out of bounds"
    })
  }

  boards[name].board[row][column] = (boards[name].board[row][column] + 1) % (kTileColorMax + 1)

  res.json({
    ok: true,
    message: "Toggled tile color"
  })
})

// Delete a board
router.get('/delete_board/:name', (req, res) => {
  const name = req.params.name

  if (name == undefined) {
    return res.json({
      ok: false,
      message: "Missing parameter: name"
    })
  }

  if (!boards.hasOwnProperty(name)) {
    return res.json({
      ok: false,
      message: "There is no board called " + name
    })
  }

  delete boards[name]

  res.json({
    ok: true,
    message: "Deleted board"
  })
})

router.use((req, res) => {
  res.json({
    ok: false,
    message: "Unknown route",
    help: {
      routes: ["create_board", "state", "toggle_tile", "delete_board"],
      params: {
        create_board: ["name"],
        state: ["name"],
        toggle_tile: ["name", "row", "column"],
        delete_board: ["name"],
      }
    }
  })
})

module.exports = router;
