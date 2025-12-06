---
article-id: aoc-2025/day2
title: Day 2 of Advent of Code 2025 in Charly
date: Mon, 02 Dec 2025 13:15:00 +0100
description: Day 2 of Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## Day 2

- [Back to the main article](../)
- [Previous day](../day1) - [Next day](../day3)

> This article is part of my series on implementing each Advent of Code 2025 challenge in my own
> programming language Charly.

Today's task involved determining the set of invalid IDs from a list of ID-ranges.
An ID was invalid if its string representation consisted of two repeated substrings of equal length.

E.g. `55`, `123123`, `827827` are all invalid IDs.

The second part modified the challenge to instead define an invalid ID as a repetition of `N` equally-sized substrings.

I solved the problem by looping over each ID in the provided ranges, determining the sets of potential substrings
that could form the entire ID and then checking if that ID actually consists only of `N` repetitions of that substring.

Charly does support concurrent and parallel execution of code, which I attempted at first, but the overhead of that
implementation almost doubled the execution time, so I left it at a single-threaded implementation.

```javascript
#!/usr/local/bin/charly

if ARGV.length < 2 {
  print("Missing filepath")
  exit(1)
}

const input_path = ARGV[1]
const input = readfile(input_path)

const ranges = input
    .split(",")
    .map(->(entry) {
        const (first, last) = entry.split("-")
        (first.to_number(), last.to_number())
    })

const allIds = []
ranges.each(->(range) {
    const (first, last) = range
    first.upTo(last, ->(idx) {
        allIds.push(idx)
    })
})

func checkIsInvalid(entry) {
    const length = entry.length
    const possibleParts = 1.collectUpTo(length / 2, ->(partLength) {
        entry.substring(0, partLength)
    })
        .filter(->(part) {
            // filter out parts that cannot possibly form the entire pattern
            entry.length % part.length == 0
        })

    possibleParts.filter(->(part) {
        const multiplier = entry.length / part.length
        const check = part * multiplier
        check == entry
    }).notEmpty()
}

const invalidIds = allIds
    .map(->(id) "{id}")
    .filter(->(entry) {
        checkIsInvalid(entry)
    })
    .map(->(entry) entry.to_number())

const totalSum = invalidIds.reduce(0, ->(p, c) p + c)

print(totalSum)
```

## Changes to the stdlib / VM

The only additions to the standard library today were the `Int::upTo` and `List::notEmpty` methods.
You can see the implementations of those methods below:

```javascript
func upTo(other, callback) {
    assert other instanceof Number
    if other < self {
        return []
    }

    const result = []
    let i = self
    while i <= other {
        const r = callback(i)
        result.push(r)
        i += 1
    }

    result
}
```

```javascript
func notEmpty = @length > 0
```

The individual commits can be found here:

- [`6f940e2`](https://github.com/KCreate/charly-vm/commit/6f940e22b405433ba47063359ecf0f07307fdbfc) `Added Int::upTo`
- [`bc4080d`](https://github.com/KCreate/charly-vm/commit/bc4080d66c110a5cc463b759930aa470e72e60fe) `Added List::notEmpty`

## Late-night Addendum

> Charly does support concurrent and parallel execution of code, which I attempted at first, but the overhead of that
> implementation almost doubled the execution time, so I left it at a single-threaded implementation.

This didn't quite sit right with me, so I investigated a bit.
It turned out that that the runtime was heavily bottlenecked by mutex locks/unlocks, caused by the VM
accessing the global list of object shape instances and reading to / writing from global variables.

I've removed locks where possible, added a per-processor shape caching layer and also replaced the default
`std::unordered_map` hashtable used for global variables with [greg7mdp/parallel-hashmap](https://github.com/greg7mdp/parallel-hashmap/tree/master).

These changes, alongside some minor tweaks to the implementation of the puzzle solving code, brought down execution
time by around **`60%`**.
Multi-threading the execution also resulted in a measurable performance improvement, altough not as much as I would've liked.

Below you can see the updated implementation of today's puzzle:

```javascript
#!/usr/local/bin/charly

if ARGV.length < 2 {
  print("Missing filepath")
  exit(1)
}

const input_path = ARGV[1]
const input = readfile(input_path)

const ranges = input
    .split(",")
    .map(->(entry) {
        const (first, last) = entry.split("-")
        (first.to_number(), last.to_number())
    })

const invalidIdsPerRange = ranges
    .parallelMap(->(range) {
        const (first, last) = range

        const invalidIds = []

        first.upTo(last, ->(i) {
            const entry = "{i}"

            const length = entry.length
            const parts = 1.collectUpTo(length / 2, ->(partlength) entry.substring(0, partlength))
            const possibleParts = parts.filter(->(part) {
                entry.length % part.length == 0
            })

            const isInvalid = possibleParts.any(->(part) {
                const multiplier = entry.length / part.length
                const check = part * multiplier
                check == entry
            })

            if isInvalid {
                invalidIds.push(i)
            }
        })

        invalidIds
    })
    .flatten()

const totalSum = invalidIdsPerRange.reduce(0, ->(p, c) p + c)

print(totalSum)
```

And all the commits that made up tonights late-night hacking session:

- [`29bc22a`](https://github.com/KCreate/charly-vm/commit/29bc22a2d413a3b1588908493bd2a8c38532562f) `Implemented per-proc shape lookup cache`
- [`d752e6e`](https://github.com/KCreate/charly-vm/commit/d752e6eb4b3f2ada7ef722db4b4716d90071d64c) `Use parallel_hashmap for global variables`
- [`5c2c36a`](https://github.com/KCreate/charly-vm/commit/5c2c36ad87b3416e0a3dc62ff90feb31045a3259) `Add List::any`
- [`c7ffd2e`](https://github.com/KCreate/charly-vm/commit/c7ffd2eff03493f574e56b05aef34925e543dc72) `Add List::flatten`
- [`3a06101`](https://github.com/KCreate/charly-vm/commit/3a061014221c7c19d415f119567a5bf03998b61b) `Add List::parallelMap and Int::parallelMap`
- [`387dea6`](https://github.com/KCreate/charly-vm/commit/387dea62a9f8954a9083f52ed162a76e3d874b6c) `Add Int::parallelTimes`
- [`2059053`](https://github.com/KCreate/charly-vm/commit/20590534828981282ad1731455fd429cdfecc092) `Add Int::collectUpTo`

## Even later late-night Addendum

I had to revert some previous changes, because my previous commits caused some crazy unpredictable segfaults to happen.
While I don't believe the locking I added back in again truly solved the issue, they're merely masking it, I do kind of
need a semi-working language to solve the upcoming puzzles.

I shall revisit this at a later time.

- [`908f02c`](https://github.com/KCreate/charly-vm/commit/908f02c7bfd4add1cf9cc9e16cbcb9d0603a4cc5) `Added locks around builtin class logic again`

## Links

- [Advent of Code](https://adventofcode.com/)
- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for today's challenge](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day2)
