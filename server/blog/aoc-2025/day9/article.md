---
article-id: aoc-2025/day9
title: Day 9 of Advent of Code 2025 in Charly
date: Mon, 09 Dec 2025 21:30:00 +0100
description: Day 9 of Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## Day 9

- [Back to the main article](../)
- [Previous day](../day8) - [Next day](../day10)

> This article is part of my series on implementing each Advent of Code 2025 challenge in my own
> programming language Charly.

## Part 1

The first part of today's puzzle asked you to determine the largest possible rectangle given a set of corner points.
The input data looked something like this:

```
7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3
```

Visualizing those positions on a board would look like this:

```
..............
.......#...#..
..............
..#....#......
..............
..#......#....
..............
.........#.#..
..............
```

I had to search through all possible permutations of corner points to find the largest possible rectangle.
In the above example, the largest rectangle you can make has area `50`.

```
..............
..OOOOOOOOOO..
..OOOOOOOOOO..
..OOOOOOOOOO..
..OOOOOOOOOO..
..OOOOOOOOOO..
..............
.........#.#..
..............
```

You can find my code for the first part here:

```javascript
const input_path = ARGV[1]
const lines = readfile(input_path).lines()

const corners = lines.map(->(line) {
    const (x, y) = line.split(",")
    (x.to_number(), y.to_number())
})

const rectangles = corners.unidirectionalPermutations()

const areas = rectangles.map(->(pair) {
    const (c1, c2) = pair
    const (x1, y1) = c1
    const (x2, y2) = c2

    const lengthX = (x1 - x2).abs() + 1
    const lengthY = (y1 - y2).abs() + 1

    lengthX * lengthY
})

const largestArea = areas.findMax()

print("largestArea = {largestArea}")
```

## Part 2

Part 2 modified the problem slightly.
Each input coordinate was part of a larger polygon.

Given the above example coordinates, the polygon would look like this:

```javascript
..............
.......#XXX#..
.......X...X..
..#XXXX#...X..
..X........X..
..#XXXXXX#.X..
.........X.X..
.........#X#..
..............
```

The premise of the task didn't change, you still had to find the largest possible rectangle.
Additionally, the rectangle had to fit into the polygon described by the input coordinates.

You can find my solution to part 2 below:

```javascript
const input_path = ARGV[1]
const lines = readfile(input_path).lines()

const corners = lines.map(->(line) {
    const (x, y) = line.split(",")
    (x.to_number(), y.to_number())
})

const polygon_lines = corners.adjacentPairs().concat([(
    corners.last(),
    corners.first()
)])

func polygon_lines_cross(line1, line2) {
    const (l1c1, l1c2) = line1
    const (l2c1, l2c2) = line2

    const l1_vertical = l1c1[0] == l1c2[0]
    const l2_vertical = l2c1[0] == l2c2[0]

    if l1_vertical && l2_vertical return false
    if !l1_vertical && !l2_vertical return false

    if l2_vertical {
        return polygon_lines_cross(line2, line1)
    }

    const own_x = l1c1[0]
    const own_y_lo = l1c1[1].min(l1c2[1])
    const own_y_hi = l1c1[1].max(l1c2[1])
    const other_y = l2c1[1]
    const other_x_lo = l2c1[0].min(l2c2[0])
    const other_x_hi = l2c1[0].max(l2c2[0])

    const x_match = own_x > other_x_lo && own_x < other_x_hi
    const y_match = other_y > own_y_lo && other_y < own_y_hi
    x_match && y_match
}

func point_is_on_line(point, line) {
    const (px, py) = point
    const (c1, c2) = line
    const (x1, y1) = c1
    const (x2, y2) = c2

    const line_is_vertical = x1 == x2

    if line_is_vertical {
        return px == x1 && py >= y1.min(y2) && py <= y1.max(y2)
    } else {
        return py == y1 && px >= x1.min(x2) && px <= x1.max(x2)
    }
}

func point_is_in_polygon(point, polygon) {
    let inside = false
    let i = 0
    const limit = polygon.length
    while i < limit {
        const line = polygon[i]
        const (px, py) = point
        const (c1, c2) = line
        const (x1, y1) = c1
        const (x2, y2) = c2

        if point_is_on_line(point, line) {
            return true
        }

        const crosses_scanline = y1 > py != y2 > py
        if crosses_scanline {
            const dy_total = (y2 - y1)
            const dy_to_point = (py - y1)
            const t = dy_to_point / dy_total
            const x_intersect = x1 + t * (x2 - x1)

            if px < x_intersect {
                inside = !inside
            }
        }

        i += 1
    }

    return inside
}

func get_rectangle_corners(rectangle) {
    const (c1, c2) = rectangle
    const (x1, y1) = c1
    const (x2, y2) = c2

    const minX = x1.min(x2)
    const minY = y1.min(y2)
    const maxX = x1.max(x2)
    const maxY = y1.max(y2)

    (
        (minX, minY),
        (maxX, minY),
        (maxX, maxY),
        (minX, maxY)
    )
}

func get_rectangle_lines(rectangle) {
    const (n1, n2, n3, n4) = get_rectangle_corners(rectangle)
    return [
        ((n1), (n2)),
        ((n2), (n3)),
        ((n3), (n4)),
        ((n4), (n1))
    ]
}

const rectangleAreaPairs = corners
    .unidirectionalPermutations()
    .map(->(corners) {
        const (c1, c2) = corners
        const (x1, y1) = c1
        const (x2, y2) = c2

        const lengthX = (x1 - x2).abs() + 1
        const lengthY = (y1 - y2).abs() + 1

        const area = lengthX * lengthY
        ((c1, c2), area)
    })
    .sort(->(a, b) {
        a[1] - b[1]
    })

func find_largest_rectangle {
    while rectangleAreaPairs.notEmpty() {
        const pair = rectangleAreaPairs.pop()
        const (rectangle, area) = pair

        const rectangle_lines = get_rectangle_lines(rectangle)
        const any_check_failed = rectangle_lines.any(->(line) {
            const crossed_any_polygon_line = polygon_lines.any(->(pline) {
                polygon_lines_cross(line, pline)
            })
            if crossed_any_polygon_line return true

            const (c1, c2) = line
            if !point_is_in_polygon(c1, polygon_lines) return true

            return false
        })
        if any_check_failed continue

        return pair
    }
}

const (largestRectangle, area) = find_largest_rectangle()
print("largest rectangle =", largestRectangle)
print("largest size =", area)
```

## Addendum

When comparing my solution to those of other's, I've encountered something interesting:
The naive way of solving the second part of the puzzle, checking if any of the surrounding polygon's
edges intersect the area of our target triangle, is flawed. This can be demonstrated by simply
taking a closer look at the provided example.

Here's the example again:

```
..............
.......#...#..
..............
..#....#......
..............
..#......#....
..............
.........#.#..
..............
```

The biggest *valid* rectangle you can make in this example has area `24` and uses the corners
at `9,5` and `2,3`. It looks like this:

```
..............
.......#...#..
..............
..XXXXXXXX....
..XXXXXXXX....
..XXXXXXXX....
..............
.........#.#..
..............
```

The biggest *invalid* rectangle you can make, which the *naive* implementation emits as the largest rectangle,
also has area `24`, using corners `2,5` and `9,7`.
It looks like this:

```
..............
.......#...#..
..............
..#....#......
..............
..XXXXXXXX....
..XXXXXXXX....
..XXXXXXXX.#..
..............
```

The naive approach of checking if any polygon edges intersect with this rectangle would fail, because none do!
The algorithm would still spit out the correct answer though, because `24` also just happens to be the nice of
the *actual* correct rectangle.

This also seems to be the case in the validation data provided by the puzzle. I've confirmed this to be
the case by comparing the result rectangles produced by both the *naive* and *proper* implementations of the
puzzle.

You can check if your solution is *proper* by running it against the following modified example:

```
7,1
11,1
11,10
9,10
9,6
2,6
2,3
7,3
```

Which looks like:

```
...............
.......#...#...
...............
..#....#.......
...............
...............
..#......#.....
...............
...............
...............
.........#.#...
...............
```

If your implementation is *correct*, it should produce a rectangle with area `32`, using coordinates `2,3` and `9,6`:

```
...............
.......#...#...
...............
..XXXXXXXX.....
..XXXXXXXX.....
..XXXXXXXX.....
..XXXXXXXX.....
...............
...............
...............
.........#.#...
...............
```

If your implementation is *incorrect*, it might produce a rectangle with area `40`, using coordinates `2,6` and `9,10`:

```
...............
.......#...#...
...............
..#....#.......
...............
...............
..XXXXXXXX.....
..XXXXXXXX.....
..XXXXXXXX.....
..XXXXXXXX.....
..XXXXXXXX.#...
...............
```

## Changes to the stdlib / VM

Methods I added to the standard library:

- `Int::countTo` Invoke the callback with all numbers in the range `[self, other]`
- `Number::inBetween` Convenience method for  `a <= self && self <= b`
- `List::findMin` Find the smallest entry in a list
- `List::findMinBy` Find the smallest entry in a list, based on the return value from a callback
- `List::adjacentPairs` Returns a list of all adjacent pairs in a list
- `List::unidirectionalPermutations` Returns a list of all unidirectional permutations in a list
- `List::bidirectionalPermutations` Returns a list of all bidirectional permutations in a list

You can find the individual commits below:

- [`f132f57`](https://github.com/KCreate/charly-vm/commit/f132f575bc9afa7b27ffc5b41a61bf72fcfcacb3) `Add Int::countTo`
- [`c581430`](https://github.com/KCreate/charly-vm/commit/c581430990e3747e67eb6b8d42898b346e0972b9) `Add Number::inBetween`
- [`e0a26ad`](https://github.com/KCreate/charly-vm/commit/e0a26ade3d28d3211bc5dff572bf58959e9e2ad5) `Add List::findMin and List::findMinBy`
- [`d1fda77`](https://github.com/KCreate/charly-vm/commit/d1fda7712e8f680e814a2a995061f5ed81a957c6) `Add List::adjacentPairs`
- [`062a964`](https://github.com/KCreate/charly-vm/commit/062a9643b410e8ef481dd64931b9499f457a092e) `Add List::unidirectionalPermutations`
- [`6405bcd`](https://github.com/KCreate/charly-vm/commit/6405bcdc41e012fd26f603673f2bea28148b68f9) `Add List::bidirectionalPermutations`

## Links

- [Advent of Code](https://adventofcode.com/)
- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for today's challenge](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day9)
