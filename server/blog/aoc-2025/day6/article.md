---
article-id: aoc-2025/day6
title: Day 6 of Advent of Code 2025 in Charly
date: Mon, 06 Dec 2025 15:45:00 +0100
description: Day 6 of Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## Day 6

- [Back to the main article](../)
- [Previous day](../day5)

> This article is part of my series on implementing each Advent of Code 2025 challenge in my own
> programming language Charly.

## Part 1

The first part of today's puzzle asked us to solve the math homework for the friendly cephalopods
I encountered in the garbage disposal unit. Their homework came in a file that looked like this:

```
123 328  51 64
 45 64  387 23
  6 98  215 314
*   +   *   +
```

Each column contained a list of input numbers and an operator to apply to those numbers.
The above worksheet contains four such problems:

- `123` * `45` * `6` = `33210`
- `328` + `64` + `98` = `490`
- `51` * `387` * `215` = `4243455`
- `64` + `23` + `314` = `401`

To verify your work, you had to provide the sum of all the individual problems' solutions.

My solution to part 1 of the puzzle:

```javascript
const input_path = ARGV[1]
const lines = readfile(input_path)
    .lines()
    .map(->(line, i, lines) {
        let line = line
            .split(" ")
            .filterEmpty()

        if i < lines.length - 1 {
            line = line.map(->(l) l.to_number())
        }

        line
    })
const (...data, operators) = lines

const problems = operators
    .map(->(op, index) {
        const operands = data.map(->(row) row[index])
        (op, operands)
    })

const results = problems.map(->(problem) {
    const (operand, inputs) = problem
    const result = operand == "+" ? inputs.sum() : inputs.product()
    result
})

const totalSum = results.sum()

print("totalSum = {totalSum}")
```

## Part 2

The second part of today's puzzle was a bit more complicated.
As a quick reminder, here's the example worksheet again:

```
123 328  51 64
 45 64  387 23
  6 98  215 314
*   +   *   +
```

The cephalopods have a different way of writing down their math problems than we humans do.
I'm not going to attempt to explain this myself, so instead I'll just reference the problem description:

> `Cephalopod Math`
>
> Cephalopod math is written right-to-left in columns.
> Each number is given in its own column, with the most significant digit
> at the top and the least significant digit at the bottom.
> (Problems are still separated with a column consisting only of spaces,
> and the symbol at the bottom of the problem is still the operator to use.)

This changed the problem significantly. The worksheet now consisted of these problems:

- `356` * `24` * `1` = `8544`
- `8` + `248` + `369` = `625`
- `175` * `581` * `32` = `3253600`
- `4` + `431` + `623` = `1058`

I now had to consume all input lines *right-to-left* and construct the input numbers myself.
Additionally, in the example worksheet provided, all the data columns had a width of exactly `3`.
This wasn't the case in the actual worksheet I had to process.
Each column could be anywhere from `2` to `4` characters wide.

I solved this by repeatedly popping off characters from the end of all input lines.
If all characters were whitespace, that meant I had reached the end of a problem and could move on to the next one.

The rest of the puzzle remained unchanged: solve each problem by performing either a `+` or `*` operation, and
then sum up the results to get the final solution.

My solution to part 2 of the puzzle:

```javascript
const input_path = ARGV[1]

let lines = readfile(input_path).lines()
const maxLineLength = lines.map(->(l) l.length).findMax()
lines = lines.map(->(line) {
    while line.length < maxLineLength {
        line = "{line} "
    }
    line
})

const (...inputLines, operandLine) = lines
const (inputs, operands) = (
    inputLines.map(->(line) line.chars()),
    operandLine.split(" ").filterEmpty().reverse()
)

let readerOffset = 0
const problems = operands
    .map(->(operand) {
        let inputData = []

        loop {
            if inputs.first().empty() {
                break
            }

            const charsRead = inputs.map(->(chars) {
                chars.pop()
            })

            if charsRead.all(->(c) c == " ") {
                break
            }

            const number = charsRead
                .filter(->(c) c != " ")
                .join("")
                .to_number()

            inputData.push(number)
        }

        (operand, inputData)
    })

const solutions = problems.map(->(problem) {
    const (operand, inputs) = problem
    const result = operand == "+" ? inputs.sum() : inputs.product()
    result
})

const totalSum = solutions.sum()

print("totalSum = {totalSum}")
```

## Changes to the stdlib / VM

Standard library methods I added:

- `List::all`: Checks whether the provided callback returns `true` for all entries in the list
- `List::product`: Returns the product of all numbers in the list
- `List::reverse`: Returns a copy of the list in reverse order
- `List::filterEmpty`: Filters out all elements with `length == 0`

Methods I had to modify:

- `Tuple::map`: Now returns a `List` instead of a `Tuple`

You can find the individual commits below:

- [`8abec0b`](https://github.com/KCreate/charly-vm/commit/8abec0b7ef2e7fdaea38b0ca35b6cbea975e48ed) `Add List::all`
- [`279726e`](https://github.com/KCreate/charly-vm/commit/279726eb608dddee42e2a5b03038b2c5b01d6521) `Add List::product`
- [`d967d7a`](https://github.com/KCreate/charly-vm/commit/d967d7a27090a7a548590fe94d2522de09a97373) `Add List::reverse`
- [`4cba80b`](https://github.com/KCreate/charly-vm/commit/4cba80b63965a5261c99a6cea791265e9f6921b4) `Add List::filterEmpty`
- [`9eb9e54`](https://github.com/KCreate/charly-vm/commit/9eb9e54a963378e254e9a878ec6835aea93fae27) `Modify Tuple::map to return a List, not Tuple`

## Links

- [Advent of Code](https://adventofcode.com/)
- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for today's challenge (Part 1)](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day6/day6-part1.ch)
- [Source code for today's challenge (Part 2)](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day6/day6-part2.ch)
