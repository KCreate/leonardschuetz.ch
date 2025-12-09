---
article-id: aoc-2025/day7
title: Day 7 of Advent of Code 2025 in Charly
date: Mon, 07 Dec 2025 7:15:00 +0100
description: Day 7 of Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## Day 7

- [Back to the main article](../)
- [Previous day](../day6) - [Next day](../day8)

> This article is part of my series on implementing each Advent of Code 2025 challenge in my own
> programming language Charly.

## Part 1

Today's task asked to fix the teleporter matrix in the elves teleporter room.
To do so, we need to inspect the teleporter's `tachyon manifold`.
The tachyon manifold looks something like this:

```javascript
.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............
```

In the diagram above, the `S` denotes where the tachyon beam enters the manifold.
Tachyon beams (`|`) extend downwards and can freely pass through empty space (`.`).
If a tachyon beam hits a splitter (`^`), the beam is stopped and two new tachyon beams
are emitted from the immediate left and right of the splitter.

After letting the beam pass through the entire manifold, the resulting beam paths look like this:

```javascript
.......S.......
.......|.......
......|^|......
......|.|......
.....|^|^|.....
.....|.|.|.....
....|^|^|^|....
....|.|.|.|....
...|^|^|||^|...
...|.|.|||.|...
..|^|^|||^|^|..
..|.|.|||.|.|..
.|^|||^||.||^|.
.|.|||.||.||.|.
|^|^|^|^|^|||^|
|.|.|.|.|.|||.|
```

To solve the puzzle, I had to determine how many times the beam was split.

I did this by storing the positions where a beam is currently traveling and splitting
those positions into two whenever a splitter was encountered.

You can find my solution for part 1 below:

```javascript
const input_path = ARGV[1]
const lines = readfile(input_path).lines().filter(->(r, i) i % 2 == 0)
const grid = lines.map(->(row) { row.chars() })
const splitters = grid.dropFirst(1)

let totalSplits = 0
let beamPath = grid.first().map(->(point) {
    switch point {
        case "." return false
        case "S" return true
    }
})

splitters.each(->(row) {
    const newBeamPath = beamPath.copy()

    row.each(->(point, i) {
        if beamPath[i] && point == "^" {
            newBeamPath[i - 1] = true
            newBeamPath[i + 1] = true
            newBeamPath[i] = false
            totalSplits += 1
        }
    })

    beamPath = newBeamPath
})

print("totalSplits = {totalSplits}")
```

## Part 2

The second part of the puzzle revealed that this was no *regular* tachyon manifold,
it's a `quantum tachyon manifold`. In a quantum tachyon manifold, a beam can only ever take a single path.
So when it encounters a splitter, it will only go one way, left or right.

To solve the second part, I had to determine how many possible paths
through the manifold the tachyon beam could take.

I upgraded my solution from part 1 to instead keep track of how many paths could have led to the current
position. Whenever two beams merged, their path counts were added together.

You can find my solution for part 2 below:

```javascript
const input_path = ARGV[1]
const lines = readfile(input_path).lines().filter(->(r, i) i % 2 == 0)
const grid = lines.map(->(row) { row.chars() })
const splitters = grid.dropFirst(1)

let totalSplits = 0
let beamPathsCount = grid.first().map(->(point) {
    switch point {
        case "." return 0
        case "S" return 1
    }
})

splitters.each(->(row) {
    const newBeamCount = beamPathsCount.copy()

    row.each(->(point, i) {
        if beamPathsCount[i] > 0 && point == "^" {
            newBeamCount[i - 1] += newBeamCount[i]
            newBeamCount[i + 1] += newBeamCount[i]
            newBeamCount[i] = 0
            totalSplits += 1
        }
    })

    beamPathsCount = newBeamCount
})

const totalAvailablePaths = beamPathsCount.sum()

print("totalSplits = {totalSplits}")
print("totalAvailablePaths = {totalAvailablePaths}")
```

## Changes to the stdlib / VM

No changes had to be made to either the VM or the standard library.

## Links

- [Advent of Code](https://adventofcode.com/)
- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for today's challenge](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day7)
