---
article-id: stackvm
title: Writing a virtual machine
date: Sun, 23 Apr 2017 16:00:00 +0100
description: Writing a stack based virtual machine
---

# Writing a virtual machine
## 23. April 2017

In the last couple months, my main focus was on writing a virtual machine from scratch.
What I wanted was a fully turing-complete machine which would support the following features
right out of the box:

- 64-bit floating point calculations
- An implementation of a call stack
- Registers of varying size
- It shouldn't be slow
- Implement a debugger to step through execution
- Separate process that shows a vram monitor

Besides the actual instruction set, I've also created my own version of an assembly language.
The syntax of the language is strongly inspired by the AVR assembly language.

## Overview

The general principle behind a virtual machine is pretty easy to grasp. What you have is a list
of instructions, some registers of a given size and memory. Not all virtual machines have the same
amount of registers and not all registers have the same meaning assigned to them.

One of the registers is the `ip` (Instruction Pointer) register. It points to the current
instruction. At the beginning of each cycle, the machine reads an opcode from the address
pointed to by the `ip` register. It then runs the assigned task of that instruction.

The meaning of each opcode is completly up to the semantic design of the machine. One could assign
any meaning to an opcode.

## Encoding

The executable format the machine expects is divided into two parts.

```
+--------------------------------------------------------+
| - Header section                                       |
|                                                        |
| magic            : ascii encoded NICE                  |
| entry_addr       : initial value of the ip register    |
| load_table_size  : number of entries in the load table |
| load_table       : load table                          |
+--------------------------------------------------------+
| - Segments section                                     |
+--------------------------------------------------------+
```

Each entry consts of three integers.

```
+--------------------------------------------------------+
| - Load table entry                                     |
|                                                        |
| offset  : offset into the executables segments section |
| size    : size of the segment                          |
| address : target address in the machines memory        |
+--------------------------------------------------------+
```

Given the following assembly file:

```avrasm
.org 0x500
.label entry_addr
  loadi r0, 25
  loadi r1, 25
  add r0, r0, r1

.org 0x600
.db msg_welcome 11 "hello world"
```

The machine would load the three instructions onto address `0x500` and the `"hello world"` constant at
address `0x600`.

## Registers

Available registers:

- `r0 - r59` General purpose registers
- `ip` Instruction pointer
- `sp` Stack pointer
- `fp` Frame pointer
- `flags` Flags register

The machine's registers are able to hold a 64-bit value. By default however, only the lower 32-bits
are targeted. The below code reads 16 bytes from a buffer at `0x500` and writes each `dword` into
the registers `r0` to `r3`. It also demonstrates the automatic label resolution and offset calculation
features in the assembler.

```avrasm
.def BUFFER_SIZE 16

.label entry_addr
  readc r0, (buffer + 0)
  readc r1, (buffer + 4)
  readc r2, (buffer + 8)
  readc r3, (buffer + 12)

.org 0x500
.db buffer BUFFER_SIZE 0
```

## Virtual Display

The last 38'800 bytes in memory are reserved for VRAM. The monitor process, which is also
built into the vm, displays the contents of this area in memory in color. The monitor supports
`255` different colors. A single byte encodes the color of a single pixel as `rrrgggbb`.

![Virtual Display](virtual-display.gif)

## Roadmap

In the months to come, I want to focus on writing some built-in methods for doing graphics stuff.
I'd also like to experiment with writing a simple compiler to be able to use a subset of C on my vm.

I'm open for contributions of any kind and I'd love to get some feedback on the design of my vm.

The repository is on GitHub at [github.com/KCreate/stackvm](https://github.com/KCreate/stackvm)
and is licensed under the MIT license.
