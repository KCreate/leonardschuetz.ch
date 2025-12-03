---
article-id: aoc-2025/day2
title: Day 2 of Advent of Code 2025 in Charly
date: Mon, 02 Dec 2025 13:15:00 +0100
description: Day 2 of Advent of Code 2025 in Charly
---

# Advent of Code 2025 in Charly
## Day 2

[Back to the main article](../)

Today's task involved determining the set of invalid IDs from a list of ID-ranges.
An ID was invalid if its string representation consisted of two repeated substrings of equal length.

E.g. `55`, `123123`, `827827` are all invalid IDs.

The second part modified the challenge to instead define an invalid ID as a repetition of `N` equally-sized substrings.

I solved the problem by looping over each ID in the provided ranges, determining the sets of potential substrings
that could form the entire ID and then checking if that ID actually consists only of `N` repetitions of that substring.

Charly does support concurrent and parallel execution of code, which I attempted at first, but the overhead of that
implementation almost doubled the execution time, so I left it at a single-threaded implementation.

<div class="emgithub-wrapper">
<iframe frameborder="0" scrolling="no" style="width:100%; height:536px;" allow="clipboard-write" src="https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2FKCreate%2Fadvent-of-code-2025-charly%2Fblob%2Fmain%2Fdays%2Fday2%2Fday2.ch&style=github-dark&type=code&showLineNumbers=on&showFileMeta=on&showCopy=on&maxHeight=500"></iframe>
</div>

## Changes to the stdlib / VM

The only additions to the standard library today were the `Int::upTo` and `List::notEmpty` methods.
You can see the implementations of those methods below:

<div class="emgithub-wrapper">
<iframe frameborder="0" scrolling="no" style="width:100%; height:392px;" allow="clipboard-write" src="https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2FKCreate%2Fcharly-vm%2Fblob%2F6f940e22b405433ba47063359ecf0f07307fdbfc%2Fsrc%2Fcharly%2Fstdlib%2Fboot.ch%23L162-L177&style=github-dark&type=code&showLineNumbers=on&showFileMeta=on&showCopy=on&maxHeight=500"></iframe>
</div>

<div class="emgithub-wrapper">
<iframe frameborder="0" scrolling="no" style="width:100%; height:77px;" allow="clipboard-write" src="https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2FKCreate%2Fcharly-vm%2Fblob%2Fbc4080d66c110a5cc463b759930aa470e72e60fe%2Fsrc%2Fcharly%2Fstdlib%2Fboot.ch%23L388&style=github-dark&type=code&showLineNumbers=on&showFileMeta=on&showCopy=on&maxHeight=500"></iframe>
</div>

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

<div class="emgithub-wrapper">
<iframe frameborder="0" scrolling="no" style="width:100%; height:536px;" allow="clipboard-write" src="https://emgithub.com/iframe.html?target=https%3A%2F%2Fgithub.com%2FKCreate%2Fadvent-of-code-2025-charly%2Fblob%2Fmain%2Fdays%2Fday2%2Fday2-parallel.ch&style=github-dark&type=code&showLineNumbers=on&showFileMeta=on&showCopy=on&maxHeight=500"></iframe>
</div>

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

- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Source code for today's challenge](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day2/day2.ch)
- [Source code for today's challenge (parallel)](https://github.com/KCreate/advent-of-code-2025-charly/blob/main/days/day2/day2-parallel.ch)
