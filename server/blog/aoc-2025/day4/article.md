---
article-id: aoc-2025/day4
title: Day 4 of Advent of Code 2025 in Charly
date: Mon, 04 Dec 2025 12:00:00 +0100
description: Day 4 of Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## Day 4

- [Back to the main article](../)
- [Previous day](../day3) - [Next day](../day5)

> This article is part of of my series on implementing each Advent of Code 2025 challenge in my own
> programming language Charly.

Today's task was to determine which rolls of paper the elves can access in their warehouse.
Their warehouse looked something like this:

```
..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.
```

Each `@` represents a roll of paper, while `.` are empty spots.
A roll of paper can be accessed and removed if it has fewer than four other rolls surrounding it.
The first task was determining how many rolls of paper can be immediately accessed.
Task two had me repeat this procedure until no more rolls of paper could be removed.

Find my solution below:

```javascript
#!/usr/local/bin/charly

if ARGV.length < 2 {
  print("Missing filepath")
  exit(1)
}

const input_path = ARGV[1]
const input = readfile(input_path)

const grid = input
    .split("\n")
    .map(->(row) row.split(""))

const rowc = grid.length
const colc = grid[0].length

func at_coord(grid, x, y) {
    if x < 0 || x >= colc {
        return false
    }

    if y < 0 || y >= rowc {
        return false
    }

    grid[y][x]
}

// clockwise relative coordinates starting at top left
const adjacent_coords = [
    (-1, -1),   // top left
    (0, -1),    // top middle
    (1, -1),    // top right
    (-1, 0),    // left
    (1, 0),     // right
    (-1, 1),    // bottom left
    (0, 1),     // bottom middle
    (1, 1)      // bottom right
]

func adjacent_at_coords(grid, x, y) {
    return adjacent_coords.map(->(relative) {
        const (dx, dy) = relative
        const (nx, ny) = (x + dx, y + dy)
        at_coord(grid, nx, ny)
    })
}

let current_grid = grid
let total_removed_rolls = 0
loop {

    // determine which rolls to remove this iteration
    let removed_this_iteration = 0
    const updated_grid = current_grid.map(->(row, y) {
        row.map(->(field, x) {
            const v = at_coord(current_grid, x, y)
            if v == "@" {
                const adjacents = adjacent_at_coords(current_grid, x, y)
                const less_than_four = adjacents.filter(->(p) p == "@").length < 4
                if less_than_four {
                    removed_this_iteration += 1
                    return "."
                }
            }
            return v
        })
    })

    if removed_this_iteration == 0 {
        break
    }

    current_grid = updated_grid
    total_removed_rolls += removed_this_iteration
    print("removing {removed_this_iteration} rolls, total of {total_removed_rolls}")
}

```

## Changes to the stdlib / VM

No changes to either VM or stdlib had to be done today!

## Links

- [Advent of Code](https://adventofcode.com/)
- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for today's challenge](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day4/day4.ch)
