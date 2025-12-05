---
article-id: style-check
title: Style check
date: Mon, 01 Jan 1990 00:00:00 +0100
description: Style check
---

# Style check
## 1. January 1990

hello `world` this is really *really* nice
this is some more text. **now this is important**.

- [`f0405b7`](https://github.com/KCreate/charly-vm/commit/) `Implemented Number::floor`
- [`f0405b7`](https://github.com/KCreate/charly-vm/commit/) `Implemented Number::floor`
- [`f0405b7`](https://github.com/KCreate/charly-vm/commit/) `Implemented Number::floor`

> Note: here are some colors
>
> - red
> - green
> - blue
> - orange
> - yellow
> - pink

1. lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet
2. lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet
3. lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet

- lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet
- lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet
- lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet lorem ipsum dolor sit amet

> hello `world` foo [`f0405b7`](https://github.com/KCreate/charly-vm/commit/)

```
+- Sign bit
|+- 11 Exponent bits
||          +- 52 Mantissa bits
vv          v
S[Exponent-][Mantissa------------------------------------------]
```

```
const invalidIdsPerRange = ranges
            const length = entry.length
            const parts = 1.collectUpTo(length / 2, ->(partlength) entry.substring(0, partlength))
            const possibleParts = parts.filter(->(part) {
                entry.length % part.length == 0
            })
    })
    .flatten()

const totalSum = invalidIdsPerRange.reduce(0, ->(p, c) p + c)

print(totalSum)
```

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

```
const parts = 1.collectUpTo(length / 2, ->(partlength) entry.substring(0, partlength))
```

```javascript
const parts = 1.collectUpTo(length / 2, ->(partlength) entry.substring(0, partlength))
```

![](./3ds.jpg)

> Image: This is an image of a new Nintendo 3DS Majoras Mask Special Edition

hello world more text here

---

## Links

- [Links at the bottom of the page](https://google.com/)
- [Links at the bottom of the page](https://google.com/)
- [Links at the bottom of the page](https://google.com/)
- [Links at the bottom of the page](https://google.com/)
- [Links at the bottom of the page](https://google.com/)
