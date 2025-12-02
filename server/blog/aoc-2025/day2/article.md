---
article-id: aoc-2025/day2
title: Day 2 of Advent of Code 2025 in Charly
date: Mon, 02 Dec 2025 13:15:00 +0100
description: Day 2 of Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## Day 2

[Back to the main article](../)

Todays task involved determining the set of invalid IDs from a list of ID-ranges.
An ID was invalid if its string representation consisted of two repeated substrings of equal length.

E.g. `55`, `123123`, `827827` are all invalid IDs.

The second part modified the challenge to instead define an invalid ID as a repetition of `N` equally-sized substrings.

I solved the problem by looping over each ID in the provided ranges, determining the sets of potential substrings
that could form the entire ID and then checking if that ID actually consists only of `N` repetitions of that substring.

Charly does support concurrent and parallel execution of code, which I attempted at first, but the overhead of that
implementation almost doubled the execution time, so I left it at a single-threaded implementation.

<div>
<iframe frameborder="0" scrolling="no" style="width:100%; height:554px;" allow="clipboard-write" src="https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2FKCreate%2Fadvent-of-code-2025-charly%2Fblob%2Fmain%2Fdays%2Fday2%2Fday2.ch&style=github-dark&type=code&showLineNumbers=on&showFileMeta=on&showCopy=on&maxHeight=500"></iframe>
</div>

## Changes to the stdlib / VM

The only additions to the standard library today were the `Int::upTo` and `List::notEmpty` methods.
You can see the implementations of those methods below:

<div>
<iframe frameborder="0" scrolling="no" style="width:100%; height:412px;" allow="clipboard-write" src="https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2FKCreate%2Fcharly-vm%2Fblob%2F6f940e22b405433ba47063359ecf0f07307fdbfc%2Fsrc%2Fcharly%2Fstdlib%2Fboot.ch%23L162-L177&style=github-dark&type=code&showLineNumbers=on&showFileMeta=on&showCopy=on&maxHeight=500"></iframe>
</div>

<div>
<iframe frameborder="0" scrolling="no" style="width:100%; height:97px;" allow="clipboard-write" src="https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2FKCreate%2Fcharly-vm%2Fblob%2Fbc4080d66c110a5cc463b759930aa470e72e60fe%2Fsrc%2Fcharly%2Fstdlib%2Fboot.ch%23L388&style=github-dark&type=code&showLineNumbers=on&showFileMeta=on&showCopy=on&maxHeight=500"></iframe>
</div>

The individual commits can be found here:

- [`6f940e2`](https://github.com/KCreate/charly-vm/commit/6f940e22b405433ba47063359ecf0f07307fdbfc) `Added Int::upTo`
- [`bc4080d`](https://github.com/KCreate/charly-vm/commit/bc4080d66c110a5cc463b759930aa470e72e60fe) `Added List::notEmpty`

## Links

- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for todays challenge](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day2/day2.ch)
