### Draft
# Dynamic typing and NaN-boxing
## The far far future

Many modern programming languages have a feature called dynamic typing.
Dynamic typing allows you to change and look up the type of a variable at runtime.
This allows you, the programmer, to remove type hints from your code.
While this reduces the learning-curve for any given language, it also means you now have to
trust yourself and other people to always use the correct types.

```javascript
// Initialize the variable a with type string
let a = "hello world"

// Change the type to integer
a = 25

// Change the type to array
a = ["bears", "beets", "battlestar galactica"]
```

In this article I will describe some approaches to how one might implement dynamic typing.
I will begin with simple, inefficient implementation and then slowly work my way up, explaining
the shortcomings along the way.
In the end I will introduce the value-representation technique called NaN-boxing.

By the end of this article I hope that you will have gained at least a basic understanding of
how NaN-boxing works and what it tries to accomplish. If you want to see NaN-boxing in action, you may
check out my toy programming language at [KCreate/charly-vm](https://github.com/KCreate/charly-vm)

## The naive approach

Lets make up a new toy language, supporting six primitive types.

- Integers
- 64-bit Floats
- Booleans
- Strings
- Arrays
- Object

The implementation of our toy language may choose to represent each Value with a struct, storing
the type and the actual value of it.
Notice how each primitive type has its own member field.

```C++
enum ValueType : uint8_t {
  TYPE_FLOAT,
  TYPE_INT,
  TYPE_BOOL,
  TYPE_STRING,
  TYPE_ARRAY,
  TYPE_OBJECT
};

struct Value {
  ValueType type;

  double              as_float;
  int64_t             as_int;
  bool                as_boolean;
  string              as_string;
  vector<Value*>      as_array;
  map<string, Value*> as_object;
};
```

Easy-peasy right?
There is however a big issue with this model.
It's not very memory-efficient.
Notice how we added a new member field for every single supported type.
Since we're only using a single one of these fields at any given time, the other
fields are wasted.

Lets try and figure out how big the Value struct is going to be and how much wasted space there is.

> Challenge: Before continuing with this article,
> try to guess the final size of the struct yourself.
> You might be surprised when finding out the actual result later.
> I'm testing this on a 64-bit x86 machine, so keep that in mind.

```C++
struct Value {
  ValueType type;                 //  1 byte

  double              as_float;   //  8 bytes
  int64_t             as_int;     //  8 bytes
  bool                as_boolean; //  1 byte
  string              as_string;  // 32 bytes
  vector<Value*>      as_array;   // 24 bytes
  map<string, Value*> as_object;  // 48 bytes
};
```

Lets start by simply adding all the member field sizes together.
This brings us to a result of **122 bytes**.

Lets now see what the actual size of our struct is, using the C builtin `sizeof` method.

```C++
cout << "sizeof(Value) = " << sizeof(Value);
// sizeof(Value) = 136
```

Weird, where do these extra 14 bytes come from?
Did we find a compiler-bug?
No, these extra bytes are being inserted by the compiler to correctly align the values in memory.

Each primitive type in the C language has its own preferred memory alignment.
The compiler will actually insert some "gaps" into your struct, to align all
member values to their correct boundaries.

| Type     | Size (bytes) | Alignment |
|----------|--------------|-----------|
| char     | 1            | 1 byte    |
| short    | 2            | 2 bytes   |
| int      | 4            | 4 bytes   |
| long int | 8            | 8 bytes   |
| float    | 4            | 4 bytes   |
| double   | 8            | 8 bytes   |

After those "gaps" have been added to our Value struct, it would look like this:

```C++
struct Value {
  ValueType type;
  char                __gap1[7];  // <- inserted gap

  double              as_float;
  int64_t             as_int;
  bool                as_boolean;
  char                __gap2[7];  // <- inserted gap
  string              as_string;
  vector<Value*>      as_array;
  map<string, Value*> as_object;
};
```

This explain where the additional 14 bytes come from.
However, we're now allocating 136 bytes just to store a 1 byte boolean value.
This is kinda ridiculous.

## Tagged Unions

Lets try and optimize our struct a little bit.
C has a feature called unions. It allows us to overlap all those member values.
This is called a **Tagged Union**.
Lets modify our struct and check its size again.

```C++
struct Value {
  ValueType type;

  union {
    double              as_float;
    int64_t             as_int;
    bool                as_boolean;
    string              as_string;
    vector<Value*>      as_array;
    map<string, Value*> as_object;
  };
};

cout << "sizeof(Value) = " << sizeof(Value);
// sizeof(Value) = 56
```

We reduced our Value struct size from 136 to 56 with this one simple trick.
The biggest member field would be the `map<string, Value*>` at 48 bytes.
Since the type field takes up only a single byte, and the remaining fields inside the union
need to be mostly aligned to 8 bytes, the compiler will still insert a 7 byte gap between the type
and the union.

While we improved the memory footprint of each value by a lot, we're still wasting a lot of
space when storing the number or boolean values.
Can we do any better than this?

Yes we can!

## NaN-boxing

Here is where NaN-boxing comes in. NaN-boxing allows you to cram extra information into the
NaN-value that exists within the floating-point spectrum of numbers.
Lets first take a look at how a double-precision floating-point number is stored in memory.

An IEEE 754 double-precision float is a regular 64-bit value, with its bits laid out as follows:

```
+- 1 Sign bit
|+- 11 Exponent bits
||            +- 52 Mantissa bits
||            |
vv            v
S[Exponent---][Mantissa--------------------------------]
```

> Note: I've trimmed the ascii graphic a little bit,
> as it wouldn't fit onto the page without scrolling otherwise.

The exact way these bits are interpreted is not important.
What's important however, is how a NaN value is represented.
A NaN value is any float value that has all its exponent bits set to 1.
The standard also distinguishes between "quiet" and "signalling" NaN values.

```
              +- This bit signals a quiet NaN
              v
-[NaN        ]1-----------------------------------------
```

"Quiet" NaNs simply flow through any arithmetic operations, while the "signalling" type
will throw an exception once detected.
For our intents and purposes, we always use the quiet type.

With the exponent- and quiet bits set, we are now left with 52 bits.
This is just enough space to store a full pointer in there.
Modern 64-bit systems actually only use the lower 48 bits of a pointer, meaning we've got no
trimming issues here.
If the sign-bit is set to 1, the NaN value stores a pointer.
If the sign-bit is set to 0, we can use an additional 3 bits inside the Mantissa to describe
8 different short types to be encoded.

```
+- If set, denotes an encoded pointer
|              + Stores the type id of the encoded short value
|              |
v              v
S[NaN        ]1TTT--------------------------------------

The type bits map to the following values
000: NaN
001: false
010: true
011: null
100: integers
101: symbols:
110: string (packed)
111: string (first payload byte stores the length)
```

> The above type ids are extracted from my own toy programming language, Charly.
> You can choose any types you want, as long as they fit into the remaining 48 bits of the NaN value.

You might have spotted the string types. We can actually store small strings of up to 6 bytes inside
our NaN-boxed value representation.
We distinguish between packed (exactly 6 bytes long) and non-packed strings (0 - 5 bytes).
The non-packed string uses the first byte to store the length field, denoting how many of the remaining
bytes contain actual data.

And here we have it, we can now store integers, floats, booleans and several other small types
inside a single 8 byte value.
This is great, because now the compiler can simply pass these values
around inside registers and we save ourselves a pointer dereference every time we want to do
an operation on these small types.

To use this system in the most painless way possible, one would implement several helper methods
that would do the tricky bitmasking to extract the payload from the NaN values.
My toy language Charly has all these methods implemented [here](https://github.com/KCreate/charly-vm/blob/main/include/value.h#L394-L1610).

## Alternatives

There exists an alternative to NaN-boxing, which is called Pointer-tagging.
If you want to learn more about Pointer-tagging, go check out my friend
[Max's blog article on Pointer tagging](https://bernsteinbear.com/)
