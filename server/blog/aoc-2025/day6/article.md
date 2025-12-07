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

## Late-night addendum

I was really inspired by the solution that [Lukas Lebovitz](https://github.com/lukaslebo/AdventOfCode/blob/3fc3f5ef8843e10921c085820dff97835f17e94f/year2025/src/day06/Day06.kt#L38-L58) came up with, so I decided to port it to Charly.
Since his code relies heavily on Kotlin standard library functions, I first had to implement those in the
Charly standard library as well. My final version looks like this:

```javascript
const input_path = ARGV[1]

// ensure all lines have the same length, as the IDE will remove trailing spaces
const lines = readfile(input_path).lines().apply(->(lines) {
    const maxLength = lines.findMaxBy(->(it) it.length).length
    lines.map(->(line) line.padRight(maxLength, " "))
}).map(->(line) line.chars())

// originally implemented in Kotlin by @lukaslebo
let totalSum = 0
const currentProblemOperands = []
lines.first().indices().reverse().each(->(i) {
    const column = lines.map(->(line) line[i])
    const digits = column.dropLast(1)
    const operand = column.last()

    if (digits.all(->(d) d == " ")) {
        i -= 1
        return
    }

    currentProblemOperands.push(digits.join("").to_number())

    switch operand {
        case "+" totalSum += currentProblemOperands.sum()
        case "*" totalSum += currentProblemOperands.product()
        default return
    }
    currentProblemOperands.clear()
})

print("totalSum = {totalSum}")
```

I added the following methods to the standard library:

- `Value::also`: Runs the provided callback and returns `self`
- `Value::apply`: Runs the provided callback and returns the callback's result
- `Number::downTo`: Downwards counting variant of `Number::upTo`
- `Number::collectDownTo`: Downwards counting variant of `Number::collectUpTo`
- `String::padLeft`: Pads the beginning of a string to reach a desired minimum length
- `String::padRight`: Pads the end of a string to reach a desired minimum length
- `List::clear`: Clears the contents of a list
- `List::indices`: Returns a list of all valid indices
- `List::takeFirst`: Returns a copy of the list with the first `N` elements
- `List::takeLast`: Returns a copy of the list with the last `N` elements
- `List::dropFirst`: Returns a copy of the list without the first `N` elements
- `List::dropLast`: Returns a copy of the list without the last `N` elements

I modified the following method:

- `List::join`: Added an optional mapping callback to preprocess the list contents before joining

You can find the individual commits below:

- [`aab7c9c`](https://github.com/KCreate/charly-vm/commit/aab7c9c9133afc1adf5d2f56cf7a462a19d37d90) `Add Value::also`
- [`3a13da5`](https://github.com/KCreate/charly-vm/commit/3a13da521c5850d31eddb339039ec85628476145) `Add Value::apply`
- [`1c49921`](https://github.com/KCreate/charly-vm/commit/1c49921e4a84428dff27631aa7a694ff21448aeb) `Add Number::downTo`
- [`f61f990`](https://github.com/KCreate/charly-vm/commit/f61f9903fea0075b791e5b2a8868eaa394aed523) `Add Number::collectDownTo`
- [`7f76963`](https://github.com/KCreate/charly-vm/commit/7f769637ae6d56c9d8dfc02b03c45a8b6dd0ab5b) `Add String::padLeft and String::padRight`
- [`fa1c6d1`](https://github.com/KCreate/charly-vm/commit/fa1c6d1355b67edb382b6edbae582042e1ac1357) `Add List::clear`
- [`0fb468d`](https://github.com/KCreate/charly-vm/commit/0fb468d064f00b1cb2640cef0d5f6657ceb957be) `Add List::indices`
- [`e89aa67`](https://github.com/KCreate/charly-vm/commit/e89aa67249eb218c17c49f34ddb15666043fd805) `Add map callback to List::join`
- [`e52e0b5`](https://github.com/KCreate/charly-vm/commit/e52e0b5fa7556fc58788861f4ff88a2662e19f21) `Add List::dropFirst and List::dropLast`
- [`579df89`](https://github.com/KCreate/charly-vm/commit/579df8937ff08f91660e7e987221fb1339e35d30) `Add List::takeFirst and List::takeLast`

## Links

- [Advent of Code](https://adventofcode.com/)
- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for today's challenge](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day6)
