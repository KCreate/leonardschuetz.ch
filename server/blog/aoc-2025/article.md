---
article-id: aoc-2025
title: Advent of Code 2025 in Charly
date: Mon, 01 Dec 2025 23:00:00 +0100
description: Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## 1. December 2025

This year I'm committing to implementing each [Advent of Code](https://adventofcode.com/) challenge
in my [programming language Charly](https://github.com/KCreate/charly-vm).

Charly is a dynamically typed,
fully parallel programming language that I've been developing off and on since 2016.

From a programming language development perspective, the current iteration of Charly
contains some really neat things (my biased opinion), most notably:

- Bytecode compiler and virtual machine
- Parallel fiber scheduler and runtime (aka green threads, goroutines-ish)
- Generational and compacting garbage collector
- Small-value representation via pointer-tagging
- Object-shape system to improve performance of attribute access
- Native code implementations of some standard-library methods
- A tiny one-byte lock implementation used to synchronize per-object operations
- A custom per-processor bump allocator
- Written fully from scratch in C++ (except `fcontext` from the Boost library, used for user-space context-switches)

While the compiler, virtual machine, and general runtime are somewhat mature (for a hobby side-project), the same
can't be said for the standard library.
If you take a look at the [standard library](https://github.com/KCreate/charly-vm/tree/rewrite/src/charly/stdlib),
you will notice the following:

> _It is barren._

The stdlib lacks the vast majority of features that a modern language would normally provide.
Adding all the necessary building blocks to solve the daily puzzles thus becomes part of the challenge.

Because of the compounding effect of this, there might be days where no changes are required, and days
where I'll have to reinvent the wheel to get things running. I might not post every day, only on days where
something interesting has been built.

> Huge thanks to my employer [Zürcher Kantonalbank](https://www.zkb.ch/en/home.html) for giving us an hour
> of time each day to work on these puzzles!

## Days

- [Day 1](./day1)
- [Day 2](./day2)
- [Day 3](./day3)
- [Day 4](./day4)
- [Day 5](./day5)
- [Day 6](./day6)
- [Day 7](./day7)
- [Day 8](./day8)
- [Day 9](./day9)
- [Day 10](./day10)

You can find the source code for each daily challenge
[on my GitHub](https://github.com/KCreate/advent-of-code-2025-charly).
