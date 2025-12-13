---
article-id: aoc-2025/day12
title: Day 12 of Advent of Code 2025 in Charly
date: Mon, 13 Dec 2025 2:30:00 +0100
description: Day 12 of Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## Day 12

- [Back to the main article](../)
- [Previous day](../day11)

> This article is part of my series on implementing each Advent of Code 2025 challenge in my own
> programming language Charly.

## Task

Today's puzzle dropped us into a large cavern full of Christmas trees and a bunch of differently shaped presents.
The elves hand me a description of how each present is shaped, how much space is available below each christmas tree
and how many of each type of present must be placed below that tree.

For example:

```
0:
###
##.
##.

1:
###
##.
.##

2:
.##
###
##.

3:
##.
###
##.

4:
###
#..
###

5:
###
.#.
###

4x4: 0 0 0 0 2 0
12x5: 1 0 1 0 2 2
12x5: 1 0 1 0 3 2
```

The input starts with a list of standard present shapes.
Each shape is given an index and shown as a small 2D grid of `#` and `.` characters.
A `#` marks a unit cell that the present occupies, while `.` marks empty space inside the shape's bounding box.

After the shape list comes a list of rectangular regions under the christmas trees.
Each region is described by its width and height (for example `12x5`), followed by a list of counts that
specifies how many presents of each shape index must be placed into that region.

Presents must be placed on the region's unit grid and cannot be stacked.
Shapes may be rotated and flipped.
Occupied cells (`#`) from different presents may not overlap, but empty cells (`.`) do not block
anything and can be shared with other shapes.

The task is to check each region and determine whether all required presents can fit.
The final answer is how many of the listed regions are solvable.

## Implementation

I began my attempt by determinig the minimum total amount of cells that each region must contain to be able to
accomodate all blocked (`#`) cells from all required presents.
If the region doesn't have enough space in it to accomodate the blocked cells, then that means that there is no
way we could possibly arrange all the presents to make them fit.

```javascript
const input_path = ARGV[1]
const lines = readfile(input_path).lines()

const (presents, regions) = parse_input(lines)

const valid_regions = regions.filter(->(region, region_id) {
    const (size, present_ids) = region
    const (x, y) = size

    const gridArea = x * y
    const minimumRequiredArea = present_ids.map(->(count, i) {
        count * presents[i].map(->(r) [...r].sum()).sum()
    }).sum()

    gridArea >= minimumRequiredArea
})

print("there are {valid_regions.length} regions that might fit the presents")
```

The next step would have been to attempt to place each present, in any possible orientation,
flipped horizontally and vertically, in any possible position on the grid.
You then would have to iterate over all possible combinations of those factors to figure out if
the region is solvable or not.
This apprach could've been implemented as a DFS search over all possible present placements.

The validation input had regions with areas up to `50x50` with hundreds of presents that had to be placed.
I did some napkin-calculations and figured out that this would take an astronomical amount of time.

At this point it dawned on me that I must be missing some key part of how to solve this problem.
There had to be an easier way of solving this than to just search the entire space of possible present placements.

I figured it couldn't hurt to check if all the regions that *might* be solvable are indeed solvable.
I copied the count of regions that *might* be solvable, pasted it into the solution submission field and clicked
`Submit`.

My guess turned out to be correct, the site accepted my answer and I got the star `:P`.
I do realize that I've kind of cheesed todays' puzzle, but I'm satisfied with it.

There was no second part of the puzzle, only a short message congratulating you on your success.

## Changes to the stdlib / VM

Modifications:

- `hashmap` Now allows integer values to be used as keys

Methods added to the standard library:

- `List::to_tuple` Convenience method for `(...list)`
- `List::distinct` Returns a list with no duplicate elements

You can find the individual commits below:

- [`878c986`](https://github.com/KCreate/charly-vm/commit/878c98677b8544fc46990dcc91502696718ec160) `Add List::to_tuple`
- [`b12e8f8`](https://github.com/KCreate/charly-vm/commit/b12e8f8f7f8c3cf5017dbf61ef0f13b23dd3a49f) `Allow integer keys in HashMap`
- [`92af768`](https://github.com/KCreate/charly-vm/commit/92af76858cfff729a67d9e30ee4bd2aa98f48eaa) `Add List::distinct`

## Links

- [Advent of Code](https://adventofcode.com/)
- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for today's challenge](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day12)
