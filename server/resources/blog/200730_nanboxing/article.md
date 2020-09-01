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

```
+- 1 Sign bit
|+- 11 Exponent bits
||         +- 52 Mantissa bits
||         |
vv         v
S[Exponent-][Mantissa------------------------------------------]
```

An IEEE 754 double-precision float is a 8 byte value.
The first bit is called the sign-bit.
The next 11 bits represents the Exponent
The remaining 52 bits are called the Mantissa.
The exact way these bits are interpreted is not important.
What's important however, is how a NaN value is represented.
A NaN value is any float value that has all its exponent bits set to 1.

```
S[Exponent-]Q---------------------------------------------------
            ^
            |
            +- Signalling / Quiet bit
```

The standard also distinguishes between "quiet" and "signalling" NaN values.
"Quiet" NaNs fall through any arithmetic operations, while the "signalling" type
will throw an exception once detected.
For our intents and purposes, we always use the quiet type.

With the exponent- and quiet bits set, we are now left with 52 bits.
This is more than enough to store a full pointer.
Pointers actually only use the lower 48 bits of their allotted 8 bytes, meaning we can
easily fit it into the leftover 52 bits of the float value.

Remember the sign-bit at the beginning of the float value?
We can use this bit to distinguish between encoded pointers and other short types.
Short encoded types use the 3 bits next to the quiet bits to signal their types.

```
+- If set, the remaining payload bits contain a pointer
v
1[Exponent ]1TTT------------------------------------------------
             ^
             |
             +- Three type bits, to encode more short types
```

## Implementation

In the following section of this article I will be implementing a nan-boxing system in C.
If you don't care about the step by step tutorial, you can just download the complete file
[here](boguslink).
The code in this article and the code in the complete download file may differ slightly, because of reasons.

First, lets define some type IDs for the short encoded types.

```
000 -> NaN
001 -> False
010 -> True
011 -> Null
100 -> Integer
```

Lets write some functions to encode and decode integers.
I'm going to artifically limit our system to 32-bit integers only, but you could
absolutely extend this range to 48-bits.
The reason I'm doing this is to keep this example code simpler.

```C
#include <stdio.h>
#include <stdint.h>

// Our short value type
typedef uint64_t VALUE;
typedef char bool;

// Masks for important segments of a float value
const uint64_t MASK_SIGN        = 0x8000000000000000;
const uint64_t MASK_EXPONENT    = 0x7ff0000000000000;
const uint64_t MASK_QUIET       = 0x0008000000000000;
const uint64_t MASK_TYPE        = 0x0007000000000000;
const uint64_t MASK_SIGNATURE   = 0xffff000000000000;
const uint64_t MASK_PAYLOAD_INT = 0x00000000ffffffff;

// Type IDs for short encoded types
const uint64_t MASK_TYPE_NAN     = 0x0000000000000000;
const uint64_t MASK_TYPE_FALSE   = 0x0001000000000000;
const uint64_t MASK_TYPE_TRUE    = 0x0002000000000000;
const uint64_t MASK_TYPE_NULL    = 0x0003000000000000;
const uint64_t MASK_TYPE_INTEGER = 0x0004000000000000;

// Constant short encoded values
const uint64_t kNaN   = MASK_EXPONENT | MASK_QUIET;
const uint64_t kFalse = kNaN | MASK_TYPE_FALSE;
const uint64_t kTrue  = kNaN | MASK_TYPE_TRUE;
const uint64_t kNull  = kNaN | MASK_TYPE_NULL;

VALUE encode_integer(uint32_t value) {
  return kNaN | MASK_TYPE_INTEGER | value;
}

int32_t decode_integer(VALUE value) {
  return value & MASK_PAYLOAD_INT;
}

bool is_integer(VALUE value) {
  uint64_t signature = value & MASK_SIGNATURE;
  return signature == (kNaN | MASK_TYPE_INTEGER);
}

int main() {
  int32_t input = -200;
  VALUE a = encode_integer(input);

  if (is_integer(a)) {
    int32_t value = decode_integer(a);

    if (value == input) {
      printf("Success!\n");
    } else {
      printf("Failure! Wrong value\n");
    }
  } else {
    printf("Failure! Not an encoded integer\n");
  }

  return 0;
}
```

Alright, that's quite a big wall of code.
Lets walk through it step by step and explain each piece of code along the way.

```C
// Our short value type
typedef uint64_t VALUE;
typedef char bool;
```

Just some simple typedefs.
`VALUE` is our nan boxed type.
We use this type definition to signal wether the value is an encoded value or just a raw 64-bit number.
`bool` because standard C doesn't have this type by default.

```C
// Masks for important segments of a float value
const uint64_t MASK_SIGN        = 0x8000000000000000;
const uint64_t MASK_EXPONENT    = 0x7ff0000000000000;
const uint64_t MASK_QUIET       = 0x0008000000000000;
const uint64_t MASK_TYPE        = 0x0007000000000000;
const uint64_t MASK_SIGNATURE   = 0xffff000000000000;
const uint64_t MASK_PAYLOAD_INT = 0x00000000ffffffff;

// Type IDs for short encoded types
const uint64_t MASK_TYPE_NAN     = 0x0000000000000000;
const uint64_t MASK_TYPE_FALSE   = 0x0001000000000000;
const uint64_t MASK_TYPE_TRUE    = 0x0002000000000000;
const uint64_t MASK_TYPE_NULL    = 0x0003000000000000;
const uint64_t MASK_TYPE_INTEGER = 0x0004000000000000;

// Constant short encoded values
const uint64_t kNaN   = MASK_EXPONENT | MASK_QUIET;
const uint64_t kFalse = kNaN | MASK_TYPE_FALSE;
const uint64_t kTrue  = kNaN | MASK_TYPE_TRUE;
const uint64_t kNull  = kNaN | MASK_TYPE_NULL;
```

Here we declare important masks for the individual segments of the float value.
We also add the type IDs that we came up with earlier.
At the end we declare some constants for simple short encoded types.

```C
VALUE encode_integer(uint32_t value) {
  return kNaN | MASK_TYPE_INTEGER | value;
}
```

Encoding an integer happens by simply overlaying it onto the NaN value and its type id.

```C
int32_t decode_integer(VALUE value) {
  return value & MASK_PAYLOAD_INT;
}
```

To decode an integer, simply mask it out.

```C
bool is_integer(VALUE value) {
  uint64_t signature = value & MASK_SIGNATURE;
  return signature == (kNaN | MASK_TYPE_INTEGER);
}
```

In order to check wether any encoded value is an integer, we can check its signature.
The signature consists of the first 2 bytes of the encoded value and can be used to quickly
determine the type of the encoded value.

```C
int main() {
  int32_t input = -200;
  VALUE a = encode_integer(input);

  if (is_integer(a)) {
    int32_t value = decode_integer(a);

    if (value == input) {
      printf("Success!\n");
    } else {
      printf("Failure! Wrong value\n");
    }
  } else {
    printf("Failure! Not an encoded integer\n");
  }

  return 0;
}
```

Finally, we encode an integer, check the resulting type and decode it again.
That wasn't too complicated now was it?

### Arbitrary pointers

Lets extend the code to support arbitrary heap pointers.
As previously discussed, this can be achieved by setting the sign-bit to 1.
Lets implement it!

```C
const uint64_t MASK_PAYLOAD_PTR = 0x0000ffffffffffff;

VALUE encode_pointer(void* ptr) {
  return kNaN | MASK_SIGN | (uint64_t)ptr;
}

void* decode_pointer(VALUE value) {
  return (void*)(value & MASK_PAYLOAD_PTR);
}

bool is_pointer(VALUE value) {
  uint64_t signature = value & MASK_SIGNATURE;
  return signature == (kNaN | MASK_SIGN);
}

int main() {
  int32_t input = 512;
  int32_t* data_ptr = &input;

  VALUE encoded_ptr = encode_pointer(data_ptr);

  if (is_pointer(encoded_ptr)) {
    int32_t* decoded_ptr = decode_pointer(encoded_ptr);

    if (decoded_ptr == data_ptr && *decoded_ptr == input) {
      printf("Success!\n");
    } else {
      printf("Failure! Wrong pointer\n");
    }
  } else {
    printf("Failure! Not an encoded pointer\n");
  }

  return 0;
}
```

Again, lets walk through the code step by step.

```C
const uint64_t MASK_PAYLOAD_PTR = 0x0000ffffffffffff;

VALUE encode_pointer(void* ptr) {
  return kNaN | MASK_SIGN | (uint64_t)ptr;
}

void* decode_pointer(VALUE value) {
  return (void*)(value & MASK_PAYLOAD_PTR);
}

bool is_pointer(VALUE value) {
  uint64_t signature = value & MASK_SIGNATURE;
  return signature == (kNaN | MASK_SIGN);
}
```

I've added a new mask, `MASK_PAYLOAD_PTR`.
It masks off the lower 48 bits of our VALUE type.
Remember how modern 64-bit operating systems only use the lower 48-bits for pointers?
That's the reason why we can safely do this without breaking anything.

The pointer encoding and decoding functions are pretty similar to the integer ones.
Just stick everything together to encode and mask things out to decode.

```C
int main() {
  int32_t input = 512;
  int32_t* data_ptr = &input;

  VALUE encoded_ptr = encode_pointer(data_ptr);

  if (is_pointer(encoded_ptr)) {
    int32_t* decoded_ptr = decode_pointer(encoded_ptr);

    if (decoded_ptr == data_ptr && *decoded_ptr == input) {
      printf("Success!\n");
    } else {
      printf("Failure! Wrong pointer\n");
    }
  } else {
    printf("Failure! Not an encoded pointer\n");
  }

  return 0;
}
```

Lets adapt our little testing code to test encoded pointers.
If we run this we will find that it does indeed encode and decode the pointer correctly.

You can use this ability to encode arbitrary pointers to point to some bigger
container on the heap. This container could then contain another type id to differentiate
between heap types such as arrays, maps or pretty much any other thing you can think of.

### Packed strings

So far we've only used up five of our 8 available type IDs.
Lets add a short encoded string type.
We can store small strings of up to 6 characters (bytes, not unicode codepoints)
inside our VALUE type.
We differentiate between packed strings and non-packed strings.
The packed string is a special type which signals that the stored string is
exactly 6 bytes long.
The non-packed string uses a single byte to store the length of the encoded string.

I will implement the packed string in this article and leave the implementation of the
non-packed string as an exercise to the reader :)

```C
#include <string.h> // for strncmp

// New type id for the packed string
const uint64_t MASK_TYPE_PSTRING = 0x0005000000000000;

// Checks the endianness of this system at runtime
bool IS_BIG_ENDIAN() {
  // Byte order in actual memory:
  //
  // Little-endian: 0x44 0x33 0x22 0x11
  // Big-endian:    0x11 0x22 0x33 0x44
  uint32_t check_number = 0x11223344;
  char first_byte = *(char*)(&check_number);
  return first_byte == 0x11;
}

// Assumes the input string to be at least 6 bytes in length
VALUE encode_packed_string(char* input) {
  VALUE value = kNaN | MASK_TYPE_PSTRING;
  char* buffer = (char*)&value;

  if (IS_BIG_ENDIAN()) {
    buffer[2] = input[0];
    buffer[3] = input[1];
    buffer[4] = input[2];
    buffer[5] = input[3];
    buffer[6] = input[4];
    buffer[7] = input[5];
  } else {
    buffer[0] = input[0];
    buffer[1] = input[1];
    buffer[2] = input[2];
    buffer[3] = input[3];
    buffer[4] = input[4];
    buffer[5] = input[5];
  }

  return value;
}

// Takes in a VALUE pointer to force it into memory
// The lifetime of the returned char* is bound to
// the lifetime of the inserted VALUE pointer
char* decode_packed_string(VALUE* value) {
  if (IS_BIG_ENDIAN()) {

    // On big-endian systems, the character buffer is
    // stored at an offset of 2 bytes
    return ((char*)value) + 2;
  } else {

    // On little-endian systems, the character buffer
    // is already conveniently laid out at the beginning
    return (char*)(value);
  }
}

bool is_packed_string(VALUE value) {
  uint64_t signature = value & MASK_SIGNATURE;
  return signature == (kNaN | MASK_TYPE_PSTRING);
}

int main() {
  char* input = "hello!";
  VALUE encoded_string = encode_packed_string(input);

  if (is_packed_string(encoded_string)) {
    char* string = decode_packed_string(&encoded_string);

    if (!strncmp(input, string, 6)) {
      printf("Success! string = %.6s\n", string);
    } else {
      printf("Failure! Wrong string\n");
    }
  } else {
    printf("Failure! Not a packed string\n");
  }

  return 0;
}
```

Now that's quite a load of code!
Lets break it down again and explain what's going on.

```C
#include <string.h> // for strncmp

// New type id for the packed string
const uint64_t MASK_TYPE_PSTRING = 0x0005000000000000;

// Checks the endianness of this system at runtime
bool IS_BIG_ENDIAN() {
  // Byte order in actual memory:
  //
  // Little-endian: 0x44 0x33 0x22 0x11
  // Big-endian:    0x11 0x22 0x33 0x44
  uint32_t check_number = 0x11223344;
  char first_byte = *(char*)(&check_number);
  return first_byte == 0x11;
}
```

First I've included the `string.h` library for the `strncmp` function.
We'll need it later when we're comparing the results.
Then I've added the new type id for the packed string.
Finally a function is added which checks at runtime wether we're on a little or big endian system.
You could do this at compile-time, but I was lazy and just whipped up the first thing that came to mind.

```C
// Assumes the input string to be at least 6 bytes in length
VALUE encode_packed_string(char* input) {
  VALUE value = kNaN | MASK_TYPE_PSTRING;
  char* buffer = (char*)&value;

  if (IS_BIG_ENDIAN()) {
    buffer[2] = input[0];
    buffer[3] = input[1];
    buffer[4] = input[2];
    buffer[5] = input[3];
    buffer[6] = input[4];
    buffer[7] = input[5];
  } else {
    buffer[0] = input[0];
    buffer[1] = input[1];
    buffer[2] = input[2];
    buffer[3] = input[3];
    buffer[4] = input[4];
    buffer[5] = input[5];
  }

  return value;
}
```

The `encode_packed_string` function takes in a char pointer to a buffer containing at least
6 bytes of data.
We do no bounds-checking, so the caller needs to make sure their buffer has the correct size.
Because the byte order changes between little and big endian systems, we have to specialize
the copying of the buffer for each system.

```C
// Takes in a VALUE pointer to force it into memory
// The lifetime of the returned char* is bound to
// the lifetime of the inserted VALUE pointer
char* decode_packed_string(VALUE* value) {
  if (IS_BIG_ENDIAN()) {

    // On big-endian systems, the character buffer is
    // stored at an offset of 2 bytes
    return ((char*)value) + 2;
  } else {

    // On little-endian systems, the character buffer
    // is already conveniently laid out at the beginning
    return (char*)(value);
  }
}
```

Because the actual string data is stored in the VALUE type, we have to get this value
into memory somehow.
We do this by forcing the caller to pass us a pointer to it.
We then figure out where the buffer is located within the VALUE and return a pointer to the
first character.
We don't do any copying or allocation of new memory, so the lifetime of the returned
pointer cannot exceed the lifetime of the memory where the initial VALUE was stored.

```C
bool is_packed_string(VALUE value) {
  uint64_t signature = value & MASK_SIGNATURE;
  return signature == (kNaN | MASK_TYPE_PSTRING);
}
```

Checking for a packed string follows the same procedure as the other types.
Simply mask out the signature and compare it against the known packed-string signature.

```C
int main() {
  char* input = "hello!";
  VALUE encoded_string = encode_packed_string(input);

  if (is_packed_string(encoded_string)) {
    char* string = decode_packed_string(&encoded_string);

    if (!strncmp(input, string, 6)) {
      printf("Success! string = %.6s\n", string);
    } else {
      printf("Failure! Wrong string\n");
    }
  } else {
    printf("Failure! Not a packed string\n");
  }

  return 0;
}
```

Running the little test shows us that this indeed does work.

And there we have it, a fully functioning implementation of NaN boxing.
You can now represent small values directly inside the VALUE type, without any memory
loads at all.
This greatly reduces the overall memory load, as we now don't have to allocate any memory
for integers, floats, booleans and any other small types that fit into the VALUE anymore.
Great!

## Alternatives

An alternative to NaN-boxing would be Pointer-tagging.
To find out what Pointer-tagging is and how it works, I will kindly redirect you to my
friend Max's blog.
The article I'm referencing is the second part of his series where he writes a Lisp-to-x86 compiler
from scratch, in C.
It contains a section about pointer-tagging which is quite interesting.

Max's article: [Compiling a Lisp: Integers](https://bernsteinbear.com/blog/compiling-a-lisp-2/)

## Conclusion

I hope you found this article interesting and that it provided you a good introduction
to NaN-boxing, how it works and how it is used inside language runtimes to improve the overall
memory efficiency.

If you want to see an actual implementation of NaN-boxing inside a language-runtime,
please check out my toy programming language [Charly](https://github.com/KCreate/charly-vm).
