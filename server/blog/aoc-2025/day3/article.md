---
article-id: aoc-2025/day3
title: Day 3 of Advent of Code 2025 in Charly
date: Mon, 03 Dec 2025 13:15:00 +0100
description: Day 3 of Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## Day 3

- [Back to the main article](../)
- [Previous day](../day2) - [Next day](../day4)

Today's task was determining which batteries to turn on to reach the highest possible `joltage`.
Batteries were grouped together into a bank.

For example: `987654321111111` is a battery bank that consists of `15` batteries, each with a lower `joltage` rating
than the one before it. The total output `joltage` of a bank is equal to the number formed by the `joltage` ratings
of each battery that is turned on.

For example, if you have a bank like `12345` and you turn on battery `2` and `4`, you get a total of `24 jolts`.

Part 1 of the puzzle required finding the largest possible `joltage` achievable by turning on exactly two batteries.
Part 2 modified the task by instead requiring `12` batteries to be turned on.

I solved the task by determining which battery, when turned on, would result in the largest possible `joltage`
for the entire bank, and then repeating this as many times as required.

Interestingly, parallelizing the computation via the `List::parallelMap` method I added yesterday actually
resulted in a noticeable speedup of around `4x`. 😁

<div class="emgithub-wrapper">
<iframe frameborder="0" scrolling="no" style="width:100%; height: 536px" allow="clipboard-write" src="https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2FKCreate%2Fadvent-of-code-2025-charly%2Fblob%2Fmain%2Fdays%2Fday3%2Fday3.ch&style=github-dark&type=code&showLineNumbers=on&showFileMeta=on&showCopy=on&maxHeight=500"></iframe>
</div>

## Changes to the stdlib / VM

No changes to the VM itself had to be made, but I did add a good amount of new functionality to the standard library.

- [`9fd4ac3`](https://github.com/KCreate/charly-vm/commit/9fd4ac30e43634d2fd8d9b2b6112802791660a4c) `Add Number::max and Number::min`
- [`165d6fd`](https://github.com/KCreate/charly-vm/commit/165d6fdc5eb63792c5165c53b2b9cdc7e86138fb) `Add default callback for Int::collectUpTo`
- [`c486987`](https://github.com/KCreate/charly-vm/commit/c486987f2333fa7c5cc6fa406af2e3614ce5db18) `Add List::mapNotNull`
- [`e464b51`](https://github.com/KCreate/charly-vm/commit/e464b51b3a1af156736a0c9e355ba5081c7f43d8) `Add List::sublist`
- [`9dfd78e`](https://github.com/KCreate/charly-vm/commit/9dfd78e8c36b494dc13b0c399b2ee5361940ab3b) `Add List::sum`
- [`c8acbf5`](https://github.com/KCreate/charly-vm/commit/c8acbf588f9e2324f0f472ad4d5d8134e705eaf4) `Add List::join`
- [`7de6f7e`](https://github.com/KCreate/charly-vm/commit/7de6f7ec116c2399ffa6f95c65e8b4a54765c137) `Add List::findMax and List::findMaxBy`

## Links

- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for today's challenge](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day3/day3.ch)
