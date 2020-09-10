---
title: Dynamic Typing and NaN Boxing
date: 8. September 2020
description: Introduction to NaN boxing
---

# Dynamic Typing and NaN Boxing
## 8. September 2020

![NaN Boxing by @mechantecerises noshadow](nan-boxing.png)

Many modern programming languages have a feature called dynamic typing.
The key distinction between a dynamically typed and a statically typed language
is that most type checks are performed at run-time as opposed to at compile-time.
Types are no longer associated with a variable, but with the underlying value stored
inside.
Because a variable can hold any type it wants, the author has to make
sure that the expectations match the actual code.

```javascript
// Variable 'a' gets initialized with a value of type String
let a = "hello world"

// Binding is changed to a value of type Array
// The array itself can also contain any mix of types
a = [false, "bears", "beets", "battlestar galactica", 3.21]

// The type of the value that ends up being stored inside
// the variable 'result' depends on the result of the coin flip
const result = coinflip() ? "test" : 512
```

This article isn't about whether dynamic typing is a good thing or not.
My goal for this article is to show you two ways how dynamic typing might be
implemented in a language runtime and how they differ from each other.

One of those methods will be NaN boxing, a technique in which you "box" certain types of values
into the 8 bytes of a double-precision floating-point value.

## Background knowledge

In order to really understand what's going on here, I recommend you have at least some
familiarity with the C programming language.
If bitmasks and pointers are something you're scared of, I recommend you
brush up your skills by reading the following resources first:

- [Mask (wikipedia.com)](https://en.wikipedia.org/wiki/Mask_(computing))
- [Pointers in C Programming with examples](https://beginnersbook.com/2014/01/c-pointers/)

If you feel like you're comfortable with these topics, then let's go ahead!

## Tagged Unions

A tagged union is a struct which contains a union of many different other types
and a tag (or type) field which signals which type is actually stored.
We'll be implementing a tagged union supporting integers, floats, booleans and "null".
Later we'll extend the code to also support an array type.

> Note: I'm not going to bother with any real memory management (we're not calling `free` on anything)
> and I'm also going to ignore any kinds of security concerns.

```c
// The type of the stored value
typedef enum {
  TYPE_INTEGER,
  TYPE_FLOAT,
  TYPE_BOOL,
  TYPE_NULL
} ValueType;

// Container type for values
typedef struct {
  ValueType type;

  union {
    int64_t as_integer;
    double  as_float;
    bool    as_bool;
  };
} Value;
```

Via the enum `ValueType`, we're defining type IDs for all currently supported types.
This enum serves as the "tag" part of our tagged union.
In case you're unfamiliar with what the `union` keyword does, it basically overlays
all its members over the same memory.
The fields `as_integer` and `as_float` physically occupy the same space.
If we omitted the `union`, all members would be laid out consecutively.
We would waste the memory of the types that we don't use.
By using a `union` we reduce the minimum size of the `Value` struct from the sum of all
member types to the size of the biggest member type.

```c
void print_value(Value* value) {
  switch (value->type) {
    case TYPE_INTEGER: {
      printf("%li", value->as_integer);
      break;
    }

    case TYPE_FLOAT: {
      printf("%f", value->as_float);
      break;
    }

    case TYPE_BOOL: {
      printf("%s", value->as_bool ? "true" : "false");
      break;
    }

    case TYPE_NULL: {
      printf("null");
      break;
    }

    default: {
      printf("Unknown value type!");
    }
  }
}
```

Next we're defining a function which prints any value passed to it to the console.
We'll later be extending this method to accommodate more types.

```c
Value* alloc_value(ValueType type) {
  Value* ptr = (Value*)malloc(sizeof(Value));
  ptr->type = type;
  return ptr;
}
```

The function `alloc_value` allocates our Value object and assigns it a given type.
We're defining this method so we don't have to rewrite this code all the time.

```c
Value* create_integer(int64_t value) {
  Value* ptr = alloc_value(TYPE_INTEGER);
  ptr->as_integer = value;
  return ptr;
}
```

The function `create_integer` simply allocates a new Value object using the previously defined
`alloc_value` function and then writes the integer argument into the correct field.
Other methods such as `create_float` and `create_bool` follow the same principle, which is
why I've omitted them.
You can find the complete source code to everything we're doing here at the end of this article.

```c
int main() {
  print_value(create_integer(25));
  printf("\n");

  print_value(create_float(-512.1234));
  printf("\n");

  print_value(create_bool(true));
  printf("\n");

  print_value(create_null());
  printf("\n");

  return 0;
}
```

Finally, we're printing the created values using the `print_value` function.
After compiling and running the program I get the following output:

```
25
-512.1234
true
null
```

That wasn't too hard now, was it?
Any other code can now build on top of these methods.
Let's add the more complex Array type now.

```c
// The type of the stored value
typedef enum {
  ...
  TYPE_ARRAY
} ValueType;

// Container for arrays
struct Value;
typedef struct {
  struct Value** data;
  uint32_t length;
  uint32_t capacity;
} Array;

// Container type for values
typedef struct {
  ValueType type;

  union {
    ...
    Array as_array;
  };
} Value;
```

I've added a new type ID for the array type to our `ValueType` enum.
Next I've embedded the newly created `Array` struct into our tagged union.
Inside that struct we store a pointer to a list of `Value*` entries.
We also store the current amount of items in the array (`length`) and the maximum
capacity.

```c
void print_value(Value* value) {
  switch (value->type) {
    case TYPE_ARRAY: {
      Value** value_list = (Value**)(value->as_array.data);

      printf("[");
      for (uint32_t i = 0; i < value->as_array.length; i++) {
        Value* item = value_list[i];
        print_value(item);
        if (i != value->as_array.length - 1) printf(", ");
      }
      printf("]");

      break;
    }
  }
}
```

The `print_value` function gets another handler for the newly added `TYPE_ARRAY` type.
It iterates over all the values inside the array and calls the `print_value` function recursively for
each one.
We also print some nice brackets and commas for better readability.

```c
Value* create_array(Value** data, uint32_t count) {
  Value* ptr = alloc_value(TYPE_ARRAY);

  // Calculate initial capacity
  uint32_t initial_capacity = 4;
  while (initial_capacity < count) {
    initial_capacity *= 2;
  }

  // Allocate value buffer and copy over elements
  size_t value_buffer_size = sizeof(Value*) * initial_capacity;
  Value** value_buffer = (Value**)malloc(value_buffer_size);
  memcpy(value_buffer, data, sizeof(Value*) * count);

  ptr->as_array.data = (void*)value_buffer;
  ptr->as_array.length = count;
  ptr->as_array.capacity = initial_capacity;

  return ptr;
}
```

The `create_array` function starts off by calculating the initial capacity.
This is done by finding the nearest power of 2 that is big enough to fit `count` items.
Afterwards we allocate the buffer and copy all the items into it.

```c
int main() {
  Value* values[4];

  values[0] = create_integer(25);
  values[1] = create_float(-512.1234);
  values[2] = create_bool(true);
  values[3] = create_null();

  Value* array = create_array((Values**)values, 4);

  print_value(array);

  return 0;
}
```

This time we store our created values inside a stack allocated buffer.
We then pass this buffer to our `create_array` function, which copies the pointers and returns
a new array.
Running this code results in the following console output:

```
[25, -512.123400, true, null]
```

Great!
We now have a fully functioning value representation using tagged unions.
Based on these principles you can add any other types you want.
A `String` type could be implemented by storing a `char*` and associated length field.
The possibilities really are endless.

## Shortcomings of using Tagged Unions

A big problem with using tagged unions is that you're wasting a lot of memory for smaller values.
Remember, the `Value` struct needs to be at least the size of its biggest member.
A quick check using `sizeof` tells me that the current size of the `Value` struct is 24 bytes.
If we want to store 100 integers, each only taking up 8 bytes of memory, we're wasting 1600 bytes
(or 1.6Kb) of memory.
It gets even worse when we're storing a bunch of boolean values.
Since they take up only a single byte, for 100 booleans this is already a waste of 2.3Kb.

Another concern is the duplication of identical values.
The runtime would have to allocate a new `Value` struct for every single new number it encounters.
This means that we potentially have hundreds or thousands of copies of the exact same number,
just in different value containers.
We could try to fix this by coming up with some scheme to reuse pointers of identical values,
however this feels more like fighting the symptoms of a bad design rather than solving the core issue.

Can we do better than this?

## NaN boxing

This is where NaN boxing comes in.
NaN boxing allows you to cram extra information into the NaN value that exists
within the floating-point spectrum of numbers.
Let's take a look at how a `double` is stored in memory.

> Note: All the bit diagrams in this article have the high bit at the left side and the low bit
> on the right.

```
+- Sign bit
|+- 11 Exponent bits
||          +- 52 Mantissa bits
vv          v
S[Exponent-][Mantissa------------------------------------------]
```

An IEEE 754 `double` is a 8 byte value.
The first bit is called the sign bit.
The next 11 bits represents the Exponent
The remaining 52 bits are called the Mantissa.
The exact way these bits are interpreted and decoded into float numbers is not important right now.
The only thing we care about is the way a NaN value is encoded.

```
-11111111111Q---------------------------------------------------
            ^
            +- Signalling / Quiet bit
```

A NaN value is any float value that has all its exponent bits set to 1.
The hardware doesn't actually care whats inside all the other bits, as long as
all the exponent bits are set to 1, its a NaN.
The standard also distinguishes between "quiet" and "signalling" NaN values.
"Quiet" NaNs fall through any arithmetic operations, while the "signalling" type
will throw an exception once detected.
For our intents and purposes, we always use the quiet type.

With the exponent and quiet bits set, we are now left with 52 bits.
This is more than enough to store a full pointer.
Pointers actually only use the lower 48 bits out of their total 64, meaning we can
easily fit it into the leftover 52 bits of the NaN value.

> Note: This is an assumption about current hardware and architectures.
> It's not guaranteed to always be the case so keep that in mind if you're
> writing code that's supposed to last for a very long time (decades+).

Let's see how a pointer would be encoded into the NaN value and how we can distinguish
a regular NaN value (these should still be available in our language) from an encoded pointer.
We can set the sign bit at the beginning of the NaN value to signal that the value is actually
an encoded pointer.

```
+- If set, signals an encoded pointer
v
1[Exponent ]1---PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
                ^
                +- Encoded pointer value (lower 48 bits)
```

With the sign bit set and the pointer value added into the NaN value, we're left
with 3 bits that are still unused.
We could for example use these bits to encode a type, which would save us an
additional memory load if all we want to know is the type of whatever we're pointing to.

If the sign bit isn't set, we would use these 3 bits to encode the type of the short encoded
value.
Let's define some type IDs.

```
000 -> NaN
001 -> False
010 -> True
011 -> Null
100 -> Integer
101 -> ???
110 -> ???
111 -> ???
```

Here it is very important that we assign the type ID `000` to NaN.
This makes it so that the normal NaN value basically encodes itself, according to our scheme.
The two boolean values and the null type are also just static constants, which means
they don't need any decoding and we can just use a single comparison to check for them.

```
+- Sign bit set to 0
|+- Exponent bits all set to 1
||
||          +- Quiet bit
||          |
||          |+- Type ID set to 100, meaning Integer
vv          vv
0[Exponent ]1100IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
                ^
                +- 48 bits left to store an integer.
```

Encoding integers is very similar to encoding pointers, with the exception of setting the sign bit to 0
and putting in the type ID for an integer.
This leaves us with enough space to store a 48 bit integer.

## Implementation

We'll start by implementing the machinery needed to encode the simple short encoded types
`NaN`, `false`, `true` and `null`.
It will provide us with the basic functionality required to later implement integers and pointers.
Due to the nature of using little unused crevices of float values to shove our
values into, floats themselves are now basically free of charge to us.

```c
// Our short value type
typedef uint64_t VALUE;

// The type of the stored value
typedef enum {
  TYPE_FLOAT,
  TYPE_BOOL,
  TYPE_NULL
} ValueType;

// Masks for important segments of a float value
#define MASK_SIGN      0x8000000000000000
#define MASK_EXPONENT  0x7ff0000000000000
#define MASK_QUIET     0x0008000000000000
#define MASK_TYPE      0x0007000000000000
#define MASK_SIGNATURE 0xffff000000000000

// Type IDs for short encoded types
#define MASK_TYPE_NAN   0x0000000000000000
#define MASK_TYPE_FALSE 0x0001000000000000
#define MASK_TYPE_TRUE  0x0002000000000000
#define MASK_TYPE_NULL  0x0003000000000000

// Signatures of encoded types
#define SIGNATURE_NAN     kNaN
#define SIGNATURE_FALSE   kFalse
#define SIGNATURE_TRUE    kTrue
#define SIGNATURE_NULL    kNull
```

We declare a `VALUE` type so we can differentiate between encoded NaNs and actual `uint64_t`s.
Next we declare some constants related to the different segments of a float number.
The `SIGNATURE_*` values allow us to quickly lookup the type of an encoded value.

```c
VALUE create_float(double value) {
  return *(VALUE*)(&value);
}

double decode_float(VALUE value) {
  return *(double*)(&value);
}
```

As mentioned before, float values are basically free of charge.
Its important to note here that we're doing the conversion between `double` and `VALUE` with
a pointer dereference.
This is so that the compiler doesn't generate any actual type conversion code.
We want the underlying bytes of the value to stay the same, while changing the
abstract type assigned to them.
If you're familiar with C++, this would be a `reinterpret_cast`.

```c
ValueType get_type(VALUE value) {
  uint64_t signature = value & MASK_SIGNATURE;
  if ((~value & MASK_EXPONENT) != 0) return TYPE_FLOAT;

  // Short encoded types
  switch (signature) {
    case SIGNATURE_NAN:   return TYPE_FLOAT;
    case SIGNATURE_FALSE:
    case SIGNATURE_TRUE:  return TYPE_BOOL;
    case SIGNATURE_NULL:  return TYPE_NULL;
  }

  return TYPE_NULL;
}
```

The `get_type` function first checks for regular float values.
We can detect these by checking if any of the exponent bits are set to 0.
Next we switch over the signature of the encoded type and return the relevant type.

```c

int main() {
  VALUE v_float   = create_float(-512.1234);
  VALUE v_bool    = kTrue;
  VALUE v_null    = kNull;

  print_value(v_float);
  printf("\n");

  print_value(v_bool);
  printf("\n");

  print_value(v_null);
  printf("\n");

  return 0;
}
```

And we're done!
Let's try to print some values.

```
-512.123400
true
null
```

Nice!

## Integer encoding

Encoding integers is the next step in our implementation.
It requires us to add a new type ID, payload mask and signature.

```c
// The type of the stored value
typedef enum {
  TYPE_INTEGER,
  ...
} ValueType;

#define MASK_PAYLOAD_INT  0x00000000ffffffff
#define MASK_TYPE_INTEGER 0x0004000000000000
#define SIGNATURE_INTEGER (kNaN | MASK_TYPE_INTEGER)
```

In order to keep the following code simpler, I've opted to only use 32 bit integers.
Because there is no actual native 48 bit integer type, you'd have to perform some
bound checks to make sure the value you're trying to store wouldn't get truncated.
We're not going to bother with that as it's not really important to get the core concept across.

```c
VALUE create_integer(int32_t value) {
  return SIGNATURE_INTEGER | (uint32_t)value;
}

int32_t decode_integer(VALUE value) {
  return value & MASK_PAYLOAD_INT;
}
```

Note how inside of the `create_integer` function we're casting the `int32_t` argument to
a `uint32_t`.
The reason we do this is to prevent negative integers from polluting the rest of the value.

```c
0x0000000000000000 |  (int32_t)( 1) // 0x0000000000000001
0x0000000000000000 |  (int32_t)(-1) // 0xffffffffffffffff
0x0000000000000000 | (uint32_t)(-1) // 0x00000000ffffffff
```

The reason this happens is because of an operation called "sign extension".
When casting from a smaller to a bigger type (in our case an implicit cast from `int32_t` to `uint64_t`)
the value will be sign extended to preserve its sign (positive / negative).
For example, if eight bits are used to store the number "`0101 1110`" (decimal 94) and we extend this
number to 16 bits, the resulting value would be stored as "`0000 0000 0101 1110`".
If eight bits are used to store the number "`1110 1010`" (decimal -22) and we extend this number
to 16 bits, the resulting value would be stored as "`1111 1111 1110 1010`".
We do not want this to happen so we cast the signed integer value to its unsigned counterpart, removing
the sign extension operation completely.

```c
int main() {
  VALUE v_int = create_integer(-25);
  print_value(v_int);
  printf("\n");

  ...

  return 0;
}
```

I've also changed the methods `get_type` and `print_value` to support our newly added integer encoding.
Let's add it to our testing code and see what we get:

```c
-25
-512.123400
true
null
```

Great!
We now have the ability to encode integers, floats, booleans and "null".

## Heap containers - Arrays

Let's implement pointer encoding and the heap allocated array type.
For that we're going to add the new type ID, payload mask and signature.

```c
// The type of the stored value
typedef enum {
  ...
  TYPE_ARRAY
} ValueType;

#define MASK_PAYLOAD_PTR 0x0000ffffffffffff
#define SIGNATURE_POINTER (kNaN | MASK_SIGN)
```

To actually store our array in memory we can now reintroduce tagged unions.

> Hold on, I thought we were moving away from tagged unions?

We indeed are!
In a way...
NaN boxing the small types has allowed us to remove them from our
tagged union struct.
Now, the only types that are still left inside it are types which are relatively big, as compared
to small types like integers or booleans.

```c
// Container for arrays
typedef struct {
  VALUE* data;
  uint32_t length;
  uint32_t capacity;
} Array;

// Container type for values
typedef struct {
  ValueType type;

  union {
    Array as_array;
  };
} HeapValue;
```

We're re-adding the Array and Value structs from our tagged union example.
`Value` got renamed to `HeapValue` to prevent confusing it with our new `VALUE` type.

```c
VALUE create_pointer(HeapValue* ptr) {
  return SIGNATURE_POINTER | (uint64_t)ptr;
}

HeapValue* decode_pointer(VALUE value) {
  return (HeapValue*)(value & MASK_PAYLOAD_PTR);
}
```

Encoding and decoding pointers, easy!

```c
VALUE create_array(VALUE* data, uint32_t count);
```

The `create_array` function can also be largely reused, only some types need to be changed in order
for it to work.
Again, the full source code is linked at the end of this article.

```c
ValueType get_type(VALUE value) {
  uint64_t signature = value & MASK_SIGNATURE;
  ...
  if (signature == SIGNATURE_POINTER) {
    HeapValue* ptr = decode_pointer(value);
    return ptr->type;
  }
  ...
  return TYPE_NULL;
}
```

In order to figure out what type a pointer points to, we have to decode it and look up the
`type` field in the `HeapValue` object.

```c
void print_value(VALUE value) {
  switch (get_type(value)) {
    ...
    case TYPE_ARRAY: {
      HeapValue* val = decode_pointer(value);

      printf("[");
      for (uint32_t i = 0; i < val->as_array.length; i++) {
        print_value(val->as_array.data[i]);
        if (i != val->as_array.length - 1) printf(", ");
      }
      printf("]");

      break;
    }
  }
}
```

Adding the print handling code for the array type turns the `print_value` function into a
recursive function.
We iterate over each item stored inside the array and call `print_value` on it.
After every item, except the last one, we emit a comma in order to improve readability at a first glance.

```c
int main() {
  VALUE v_int     = create_integer(-25);
  VALUE v_float   = create_float(-512.1234);
  VALUE v_bool    = kTrue;
  VALUE v_null    = kNull;

  VALUE values[4] = { v_int, v_float, v_bool, v_null};
  VALUE v_array   = create_array(values, 4);

  print_value(v_array);

  return 0;
}
```

Let's wrap all available types into a single array and print it and see what it gives us:

```
[-25, -512.123400, true, null]
```

Cool!
It works!

Via the same procedure you can now add even more types such as strings or hashmaps.

## Encoding strings of N <= 6

Before I end this article I want to quickly explain how you would store strings of up to
6 bytes in length inside the NaN-boxed representation.
I hereby distinguish packed (N = 6) from non-packed (N < 6) strings.

```
             +- Type ID = 101 = Packed String
             |
             ---
0[Exponent-]1101[Char 6][Char 5][Char 4][Char 3][Char 2][Char 1]
```

Let's first talk about the packed string, as its the simpler concept.
The packed string is simply a special short encoded string type which refers
to strings that are exactly 6 bytes in length.

You know those 48 bits that we use to store pointers or integers?
There is nothing preventing us from splitting these into six one-byte chunks and store
a single character in each one of them.

But why does it look like the bytes are stored in reverse?
This has to do with the endianness, or byte-order of the architecture.
The gist is, because little-endian machines store their bytes in reverse order
(least-significant byte first, most-significant byte last) we have to also store
our string in reverse order.
On big endian machines the character bytes would be laid out in the correct (non-reversed) order.
This allows us to create a `char*` pointer which points into the NaN-boxed value, treating
it as a regular character buffer.

```
             +- Type ID = 110 = Non-Packed String
             |
             ---
0[Exponent-]1110[Length][Char 5][Char 4][Char 3][Char 2][Char 1]
```

The non-packed string allows us to store strings ranging from 0 up to 5 bytes in length.
We replace the sixth byte with the length property, storing how many of the other bytes
are actual data.

I'll leave the implementation of these two types as an exercise to the reader.
If you don't want to figure this out yourself, you can go check out the source code
for my own programming language Charly, the github link is at the end of this article.

## Conclusion

I hope you found this article interesting and that it provided you with a basic understanding
of how NaN boxing works.
If you want to see an actual implementation of NaN boxing inside a language runtime,
please check out my toy programming language [Charly](https://github.com/KCreate/charly-vm).

## Alternatives

An alternative to NaN-boxing that worth mentioning is a technique called pointer tagging.
Pointer tagging relies on the fact that all regularly allocated pointers are aligned to
8 bytes.
To find out how exactly pointer tagging works, I will kindly redirect you to my friend Max's blog.
He has a great series going on where he implements a Lisp to x86 compiler, from scratch, in C.
The following two articles contain his implementation of pointer tagging.

- [Compiling a Lisp: Integers](https://bernsteinbear.com/blog/compiling-a-lisp-2/)
- [Compiling a Lisp: Booleans, characters, nil](https://bernsteinbear.com/blog/compiling-a-lisp-3/)

## Links

Source code:
- [nan-boxing.c](https://github.com/KCreate/leonardschuetz.ch/blob/master/server/resources/blog/200908_nanboxing/nan-boxing.c)
- [tagged-union.c](https://github.com/KCreate/leonardschuetz.ch/blob/master/server/resources/blog/200908_nanboxing/tagged-union.c)

Other stuff:
- [@mechantecerises IG (Header Graphic)](https://www.instagram.com/mechantecerises)
- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Max Bernstein's Blog](https://bernsteinbear.com)
