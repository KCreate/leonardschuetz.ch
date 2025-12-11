---
article-id: aoc-2025/day10
title: Day 10 of Advent of Code 2025 in Charly
date: Mon, 11 Dec 2025 23:45:00 +0100
description: Day 10 of Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## Day 10

- [Back to the main article](../)
- [Previous day](../day9) - [Next day](../day11)

> This article is part of my series on implementing each Advent of Code 2025 challenge in my own
> programming language Charly.

## Part 1

Today's puzzle required us to help the elves turn on the machines in their factory.
Each machine came with a wiring diagram like this one:

```
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
```

The symbols in the `[]` brackets displayed the required target state of the machine's indicator lights.
Each parenthesized sequence of numbers represents a button.
Each number inside a button shows which indicator lights that button toggles.
For example, the button `(2,3)` would toggle the indicator lights at index `2` and `3`.

To solve the puzzle, you must find the shortest sequence of buttons that produces the desired target state.

I implemented this as a BFS over the possible button combinations,
returning the length of the first sequence that results in the desired state.

You can find my solution below:

```javascript
const input_path = ARGV[1]
const lines = readfile(input_path).lines()

const parse_input = import "./parse-input.ch"
const machines = parse_input(lines)

const totalPresses = machines.parallelMap(->(machine) {
    const visited_states = []

    const queue = machine.buttons.map(->(button) [button])
    while queue.notEmpty() {
        const combination = queue.pop_front()
        const current_state = machine.apply_buttons_to_indicators(combination)

        if current_state == machine.indicatorLights return combination.length

        if !visited_states.contains(current_state) {
            visited_states.push(current_state)

            machine.buttons.each(->(button) {
                queue.push([...combination, button])
            })
        }
    }

    throw "failed to find a solution for {machine}"
}).sum()

print("total button presses: {totalPresses}")
```

## Part 2

Part 2 really stumped me.
While I did come up with an algorithm that solved the problem, it was *really* slow.
I modified my solution from part 1 into a DFS over the possible sequence space.

```javascript
const input_path = ARGV[1]
const lines = readfile(input_path).lines()

const parse_input = import "./parse-input.ch"
const machines = parse_input(lines)

const totalPresses = machines.map(->(machine, machine_index) {
    const queue = machine.buttons.map(->(button) [button])

    let smallest_number_of_presses = 100000
    let checked = 0
    const visited_states = []

    while queue.notEmpty() {
        const combination = queue.pop()
        const current_state = machine.apply_buttons_to_joltage_levels(combination)
        checked += 1

        if current_state == machine.joltageRequirements {
            if combination.length < smallest_number_of_presses {
                print("#{machine_index} found {combination.length} in {checked} checks")
                smallest_number_of_presses = combination.length
            }
            continue
        }

        if combination.length >= smallest_number_of_presses {
            continue
        }

        if visited_states.contains((current_state, combination.length)) continue
        visited_states.push((current_state, combination.length))

        const limitForEachButton = machine.buttons.map(->(button) {
            button.map(->(i) machine.joltageRequirements[i] - current_state[i]).findMin()
        })

        machine.buttons.each(->(button, index) {
            if limitForEachButton[index] > 0 {
                queue.push([...combination, button])
            }
        })
    }

    print("machine {machine_index} found optimal solution")
    return smallest_number_of_presses
}).sum()

print("total button presses: {totalPresses}")
```

The above solution could correctly solve the problem using the example data.
Because the validation data was much larger, and the individual machines had more buttons, my solution ran
for a really long time.
After an hour of waiting, I tried to estimate when this would complete.
A quick napkin calculation gave me the answer:

> Never
>
> Unless you're willing to wait billions and billions of years.
> I sadly won't live for that long.

The only alternative I could think of was implementing a linear-algebra equation solver.
You can represent the combination problem as a system of equations and then minimize the total number of button presses.

Implementing this in Charly proved challenging.
I eventually gave up and asked ChatGPT to implement a solution in Charly.

> ChatGPT failed

Not willing to lose today's star, I implemented a working solution in Kotlin using [Microsoft's Z3 SMT solver](https://www.microsoft.com/en-us/research/project/z3-3/).
Because my solution was heavily copy-pasted together, and most importantly not implemented in Charly, I won't share it.

## Changes to the stdlib / VM

Modifications to the virtual machine:

- Tuple arithmetic. For example `(2, 3) + (4, 1) == (6, 4)` or `(2, 3) * (3, 4) == (6, 12)`

Methods I added to the standard library:

- `List::inGroupsOf` Returns consecutive sublists of size `n`
- `List::count` Counts how often `x` appears in the list
- `List::countIf` Counts elements for which `pred(element)` evaluates to true
- `List::pop_front` Removes and returns the first element of the list

You can find the individual commits below:

- [`9f1665b`](https://github.com/KCreate/charly-vm/commit/9f1665bbfe48093c4021869d5fc88e9021d650d1) `Allow arithmetic with tuples`
- [`2f75db4`](https://github.com/KCreate/charly-vm/commit/2f75db434de417a300b593ad5152362668fe8060) `Add List::inGroupsOf`
- [`81abe78`](https://github.com/KCreate/charly-vm/commit/81abe78f3ce676a70cdb1208efbeec9cb6fbb206) `Added some default args`
- [`83b9220`](https://github.com/KCreate/charly-vm/commit/83b922037f02236ed2ec3f0877eca54ee2fafa68) `Add List::count and List::countIf`
- [`bebc35b`](https://github.com/KCreate/charly-vm/commit/bebc35bdd373c93eeab4852fc1aefac6c1d26046) `Add List::pop_front`

## Links

- [Advent of Code](https://adventofcode.com/)
- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for today's challenge](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day10)
