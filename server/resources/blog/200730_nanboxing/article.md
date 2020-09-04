### Draft
# Dynamic Typing and NaN Boxing
## The not so far future

![NaN Boxing by @mechantecerises](%%PATH%%/nan-boxing.png)
> Graphic by [@mechantecerises](https://instagram.com/mechantecerises)

Many modern programming languages have a feature called dynamic typing.
Dynamic typing means that the type of a variable can change at runtime.

```javascript
// Variable is initialized with type String
let a = "hello world"

// Type is changed to Integer
a = 25

// Type is changed to Array
a = [false, "bears", "beets", "battlestar galactica", 3.21]
```

While this reduces the learning curve for new programmers, it also means that
you now have to trust yourself and other people to always use the correct types.
Not cool.

This article isn't about wether dynamic typing is a good thing or not.
My goal for this article is to show you two ways how dynamic typing might be
implemented in a language runtime and how they differ from each other.

One of those methods will be NaN boxing, a technique in which you "box" certain types of values
into the 8 bytes of a double-precision floating-point value.

## Background knowledge

In order to really understand what's going on here, I recommend you have at least some
familiarity with the C programming language.
Understanding how memory works under the hood will also be of advantage.
If you're scared of bitmasks and pointers, don't read this article!
(or do, I'm a blog article not a cop).

## Tagged Unions

Lets begin with the concept called "Tagged Unions".
A tagged union is a struct which contains a union of many different other types
and a tag (or type) field which signals which type is actually stored.

I'll start off this section with a complete implementation of a tagged-union
value representation.
For the beginning we'll support only integers, floats, booleans and null.
We'll later extend the code to also support an Array type.

> Note: I won't do any real memory management (we're not calling `free` on anything) and I'm also
> going to ignore any kinds of security concerns.

```c
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// The type of the stored value
typedef enum : uint8_t {
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

Value* alloc_value(ValueType type) {
  Value* ptr = (Value*)malloc(sizeof(Value));
  ptr->type = type;
  return ptr;
}

Value* create_integer(int64_t value) {
  Value* ptr = alloc_value(TYPE_INTEGER);
  ptr->as_integer = value;
  return ptr;
}

Value* create_float(double value) {
  Value* ptr = alloc_value(TYPE_FLOAT);
  ptr->as_float = value;
  return ptr;
}

Value* create_bool(bool value) {
  Value* ptr = alloc_value(TYPE_BOOL);
  ptr->as_bool = value;
  return ptr;
}

Value* create_null() {
  return alloc_value(TYPE_NULL);
}

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

Lets walk through this step by step.
I'll skip over the header includes as they are pretty much boilerplate.

```c
// The type of the stored value
typedef enum : uint8_t {
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

Here we're defining the Value struct which stores the type and the union which merges
all the different supported types.
In case you're unfamiliar with what the `union` keyword does, it basically overlays
all its members over the same memory.
The fields `as_integer` and `as_float` physically occupy the same memory.
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

The `print_value` prints any values passed to it.
Easy.

```c
Value* alloc_value(ValueType type) {
  Value* ptr = (Value*)malloc(sizeof(Value));
  ptr->type = type;
  return ptr;
}

Value* create_integer(int64_t value) {
  Value* ptr = alloc_value(TYPE_INTEGER);
  ptr->as_integer = value;
  return ptr;
}

Value* create_float(double value) {
  Value* ptr = alloc_value(TYPE_FLOAT);
  ptr->as_float = value;
  return ptr;
}

Value* create_bool(bool value) {
  Value* ptr = alloc_value(TYPE_BOOL);
  ptr->as_bool = value;
  return ptr;
}

Value* create_null() {
  return alloc_value(TYPE_NULL);
}
```

The `create_*` collection of functions allocates and fills out the relevant sections of the
respective type members.

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
Lets add the more complex Array type now.

```c
// The type of the stored value
typedef enum : uint8_t {
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

void print_value(Value* value) {
  switch (value->type) {
    ...

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

    default: {
      printf("Unknown value type!");
    }
  }
}

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

Again, lets go over the changes step by step.

```c
// The type of the stored value
typedef enum : uint8_t {
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

I've added a new enum type id, the new `Array` struct and a corresponding entry in the Value struct.
The `Array` struct stores a pointer to a list of pointers to `Value` structs.
We're using a forward declaration for `Value`, since its not defined at that point in the program.
The `length` fields stores the current amount of values which are stored in the array and
the `capacity` field stores the total amount of values that would fit.
The runtime would need additional logic to expand that buffer once it is full.

```c
void print_value(Value* value) {
  switch (value->type) {
    ...

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

    default: {
      printf("Unknown value type!");
    }
  }
}
```

I've extended the `print_value` with a handler for the `TYPE_ARRAY` type.
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

The default initial capacity is doubled until we have enough space to accomodate the initial
amount of items to be copied into the array.
After we've got our buffer, we copy the items into it and store all the metadata in the Value struct.

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
We then print it out, resulting in the following console output:

```
[25, -512.123400, true, null]
```

Great!
We now have a fully functioning value representation using tagged-unions.
You could for example add a new `String` type, which stores a `char*` and an associated length field.
The possiblities really are endless.

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
We could try and come up with a scheme to reuse pointers to identical values,
this however (at least to me) gives off a very code-smelly vibe.

Can we do better than this?

## NaN boxing

This is where NaN boxing comes in.
NaN boxing allows you to cram extra information into the NaN value that exists
within the floating-point spectrum of numbers.
Lets take a look at how a `double` is stored in memory.

```
+- 1 Sign bit
|+- 11 Exponent bits
||          +- 52 Mantissa bits
vv          v
S[Exponent-][Mantissa------------------------------------------]
```

An IEEE 754 `double` is a 8 byte value.
The first bit is called the sign bit.
The next 11 bits represents the Exponent
The remaining 52 bits are called the Mantissa.
The exact way these bits are interpreted and decoded into numbers is not important right now.
The only thing we care about is the way a NaN value is encoded.
A NaN value is any float value that has all its exponent bits set to 1.

```
-11111111111Q---------------------------------------------------
            ^
            +- Signalling / Quiet bit
```

The standard also distinguishes between "quiet" and "signalling" NaN values.
"Quiet" NaNs fall through any arithmetic operations, while the "signalling" type
will throw an exception once detected.
For our intents and purposes, we always use the quiet type.

With the exponent and quiet bits set, we are now left with 52 bits.
This is more than enough to store a full pointer.
Pointers actually only use the lower 48 bits out of their total 64, meaning we can
easily fit it into the leftover 52 bits of the NaN value.

Lets see how a pointer would be encoded into the NaN value and how we can distinguish
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

With the sign-bit set and the pointer value added into the NaN value, we're left
with 3 bits that are still unused.
We could for example use these bits to encode a type, which would save us an
additional memory load if all we want to know is the type of whatever we're pointing to.

If the sign-bit isn't set, we would use these 3 bits to encode the type of the short encoded
value.
Lets define some type IDs for these short types.

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
Integers are encoded the same way as pointers, with just the sign-bit set to 0 and the type ID
set to whatever ID was assigned to Integers.

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

## Implementation

We'll start by implementing the machinery needed to encode the simple short encoded types
`NaN`, `false`, `true` and `null`.
It will provide us with the basic functionality needed to later implement integers and pointers.
Due to the nature of using little unused crevices of floating-point values to shove our
values into, floats themselves are now basically free of charge to us.
Finally, I'm going to show you how to encode strings of up to 6 bytes in length as well.

```c
#include <stdio.h>    // for printf
#include <stdint.h>   // for uint32_t, int64_t, etc...
#include <stdlib.h>   // for malloc
#include <stdbool.h>  // for the bool typedef

// Our short value type
typedef uint64_t VALUE;

// The type of the stored value
typedef enum : uint8_t {
  TYPE_FLOAT,
  TYPE_BOOL,
  TYPE_NULL
} ValueType;

// Masks for important segments of a float value
const uint64_t MASK_SIGN        = 0x8000000000000000;
const uint64_t MASK_EXPONENT    = 0x7ff0000000000000;
const uint64_t MASK_QUIET       = 0x0008000000000000;
const uint64_t MASK_TYPE        = 0x0007000000000000;
const uint64_t MASK_SIGNATURE   = 0xffff000000000000;

// Type IDs for short encoded types
const uint64_t MASK_TYPE_NAN     = 0x0000000000000000;
const uint64_t MASK_TYPE_FALSE   = 0x0001000000000000;
const uint64_t MASK_TYPE_TRUE    = 0x0002000000000000;
const uint64_t MASK_TYPE_NULL    = 0x0003000000000000;

// Constant short encoded values
const uint64_t kNaN   = MASK_EXPONENT | MASK_QUIET;
const uint64_t kFalse = kNaN | MASK_TYPE_FALSE;
const uint64_t kTrue  = kNaN | MASK_TYPE_TRUE;
const uint64_t kNull  = kNaN | MASK_TYPE_NULL;

VALUE create_float(double value) {
  return *(VALUE*)(&value);
}

double decode_float(VALUE value) {
  return *(double*)(&value);
}

ValueType get_type(VALUE value) {
  uint64_t signature = value & MASK_SIGNATURE;
  if ((~value & MASK_EXPONENT) != 0) return TYPE_FLOAT;

  // Short encoded types
  switch (signature) {
    case kNaN | MASK_TYPE_NAN:     return TYPE_FLOAT;
    case kNaN | MASK_TYPE_FALSE:
    case kNaN | MASK_TYPE_TRUE:    return TYPE_BOOL;
    case kNaN | MASK_TYPE_NULL:    return TYPE_NULL;
    case kNaN | MASK_TYPE_INTEGER: return TYPE_INTEGER;
  }

  return TYPE_NULL;
}

void print_value(VALUE value) {
  switch (get_type(value)) {
    case TYPE_FLOAT: {
      printf("%f", decode_float(value));
      break;
    }

    case TYPE_BOOL: {
      printf("%s", value == kTrue ? "true" : "false");
      break;
    }

    case TYPE_NULL: {
      printf("null");
      break;
    }

    default: {
      printf("Unknown type!");
    }
  }
}

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

As before, we'll go over each part of the program, explaining it along the way.

```c
// Our short value type
typedef uint64_t VALUE;

// The type of the stored value
typedef enum : uint8_t {
  TYPE_FLOAT,
  TYPE_BOOL,
  TYPE_NULL
} ValueType;

// Masks for important segments of a float value
const uint64_t MASK_SIGN        = 0x8000000000000000;
const uint64_t MASK_EXPONENT    = 0x7ff0000000000000;
const uint64_t MASK_QUIET       = 0x0008000000000000;
const uint64_t MASK_TYPE        = 0x0007000000000000;
const uint64_t MASK_SIGNATURE   = 0xffff000000000000;

// Type IDs for short encoded types
const uint64_t MASK_TYPE_NAN     = 0x0000000000000000;
const uint64_t MASK_TYPE_FALSE   = 0x0001000000000000;
const uint64_t MASK_TYPE_TRUE    = 0x0002000000000000;
const uint64_t MASK_TYPE_NULL    = 0x0003000000000000;
```

The 8-byte `VALUE` will become the replacement to the `Value*` from our tagged union implementation.
The enum `ValueType` also remains from our previous implementation.
The first set of hex-numbers are bitmasks which we use to access different segments of floating-point numbers.
The `MASK_SIGNATURE` mask allows us to quickly determine the type of a value, by simply comparing
the first 2 bytes (the Signature) to some constant value.
The `MASK_TYPE_*` values are the type IDs that fit into the 3 bits next to the quiet-bit.

```c
VALUE create_float(double value) {
  return *(VALUE*)(&value);
}

double decode_float(VALUE value) {
  return *(double*)(&value);
}
```

I told you encoding and decoding a float number was easy!

```c
ValueType get_type(VALUE value) {
  uint64_t signature = value & MASK_SIGNATURE;
  if ((~value & MASK_EXPONENT) != 0) return TYPE_FLOAT;

  // Short encoded types
  switch (signature) {
    case kNaN | MASK_TYPE_NAN:     return TYPE_FLOAT;
    case kNaN | MASK_TYPE_FALSE:
    case kNaN | MASK_TYPE_TRUE:    return TYPE_BOOL;
    case kNaN | MASK_TYPE_NULL:    return TYPE_NULL;
    case kNaN | MASK_TYPE_INTEGER: return TYPE_INTEGER;
  }

  return TYPE_NULL;
}
```

The function `get_type` returns the `ValueType` of the passed value.

First we check if our value is a regular NaN value, in which case it would belong to the Float type.
Next we check if any of the exponent bits are set to 0, which tells us wether this value
is a NaN or a real float value.
The switch uses the different constant signatures to select which type to return.

```c
void print_value(VALUE value) {
  switch (get_type(value)) {
    case TYPE_FLOAT: {
      printf("%f", decode_float(value));
      break;
    }

    case TYPE_BOOL: {
      printf("%s", value == kTrue ? "true" : "false");
      break;
    }

    case TYPE_NULL: {
      printf("null");
      break;
    }

    default: {
      printf("Unknown type!");
    }
  }
}
```

We can use the `get_type` function to select specific printing code.

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

Finally we create some values and print them, resulting in the following console output:

```
-512.123400
true
null
```

## Integer encoding

Lets implement integer encoding!

```c
typedef enum : uint8_t {
  ...
  TYPE_INTEGER
} ValueType;

const uint64_t MASK_PAYLOAD_INT = 0x00000000ffffffff;
const uint64_t MASK_TYPE_INTEGER = 0x0004000000000000;

VALUE create_integer(uint32_t value) {
  return kNaN | MASK_TYPE_INTEGER | value;
}

int32_t decode_integer(VALUE value) {
  return value & MASK_PAYLOAD_INT;
}

ValueType get_type(VALUE value) {
  ...
  switch (signature) {
    ...
    case kNaN | MASK_TYPE_INTEGER: return TYPE_INTEGER;
  }
}

void print_value(VALUE value) {
  switch (get_type(value)) {
    ...

    case TYPE_INTEGER: {
      printf("%i", decode_integer(value));
      break;
    }
  }
}

int main() {
  VALUE v_int     = create_integer(25);
  print_value(v_int);
  printf("\n");

  ...

  return 0;
}
```

Encoding an integers means simply masking all the different components together.
Decoding becomes equally simple, just mask out the integer and you got it.
I've done the relevant changes to the functions `get_type` and `print_value`
that allow us to print encoded integer values.

Running the new extended program results in the following output:

```c
25
-512.123400
true
null
```

Great!
We now have the ability to encode integers, floats, booleans and "null".

It is important to note however, that using NaN boxing reduces our numeric range to a theoretical
maximum of 48-bits.
Practically speaking this means you're going to use 32-bit numbers, or do a bunch of custom decoding
logic to use the full 48-bits.
I'm not going to bother with that, so lets move on.

## Heap containers - Arrays

We can largely reuse the code from our tagged union implementation, with some minor changes.

```c
#include <string.h>   // for memcpy

typedef enum : uint8_t {
  ...
  TYPE_ARRAY
} ValueType;

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

const uint64_t MASK_PAYLOAD_PTR = 0x0000ffffffffffff;

VALUE create_pointer(HeapValue* ptr) {
  return kNaN | MASK_SIGN | (uint64_t)ptr;
}

HeapValue* decode_pointer(VALUE value) {
  return (HeapValue*)(value & MASK_PAYLOAD_PTR);
}

VALUE create_array(VALUE* data, uint32_t count) {
  HeapValue* ptr = (HeapValue*)malloc(sizeof(HeapValue));
  ptr->type = TYPE_ARRAY;

  // Calculate initial capacity
  uint32_t initial_capacity = 4;
  while (initial_capacity < count) {
    initial_capacity *= 2;
  }

  // Allocate value buffer and copy over elements
  size_t value_buffer_size = sizeof(VALUE) * initial_capacity;
  VALUE* value_buffer = (VALUE*)malloc(value_buffer_size);
  memcpy(value_buffer, data, sizeof(VALUE) * count);

  ptr->as_array.data = value_buffer;
  ptr->as_array.length = count;
  ptr->as_array.capacity = initial_capacity;

  return create_pointer(ptr);
}

ValueType get_type(VALUE value) {
  ...
    if (signature == (kNaN | MASK_SIGN)) {
      HeapValue* ptr = decode_pointer(value);
      return ptr->type;
    }
  ...
}

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

int main() {
  VALUE v_int     = create_integer(25);
  VALUE v_float   = create_float(-512.1234);
  VALUE v_bool    = kTrue;
  VALUE v_null    = kNull;

  VALUE values[4] = { v_int, v_float, v_bool, v_null};
  VALUE v_array   = create_array(values, 4);

  print_value(v_array);

  return 0;
}
```

We're going to reuse some components from the tagged-union implementation again.
The `Value` struct got renamed to `HeapValue` to avoid confusing it with our new `VALUE` type.
The `Array` struct is also brought back with minor changes.
The function `create_array` remains unchanged, only updating some changed type names.

```c
VALUE create_pointer(HeapValue* ptr) {
  return kNaN | MASK_SIGN | (uint64_t)ptr;
}

HeapValue* decode_pointer(VALUE value) {
  return (HeapValue*)(value & MASK_PAYLOAD_PTR);
}

ValueType get_type(VALUE value) {
  ...
    if (signature == (kNaN | MASK_SIGN)) {
      HeapValue* ptr = decode_pointer(value);
      return ptr->type;
    }
  ...
}
```

The functions `create_pointer` and `decode_pointer` are almost identical to the
integer-encoding equivalents.

The `get_type` method needs to do some more work to figure out the type of a pointer.
This scheme only works if you're 100% sure that each pointer-`VALUE` can only point to
our custom `HeapValue` struct, meaning we know the exact layout of the memory where the
pointer points to.
We check for the pointer-specific signature and then just return the type field of the
`HeapValue` struct.

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

In order to print our newly added `Array` type, we iterate over each item
stored in it.
We also print some brackets and commas in order to improve readability.

```c
int main() {
  VALUE v_int     = create_integer(25);
  VALUE v_float   = create_float(-512.1234);
  VALUE v_bool    = kTrue;
  VALUE v_null    = kNull;

  VALUE values[4] = { v_int, v_float, v_bool, v_null};
  VALUE v_array   = create_array(values, 4);

  print_value(v_array);

  return 0;
}
```

I've updated the main method to now wrap all other types into an array, then print it.
This results in the following output:

```
[25, -512.123400, true, null]
```

Cool!
We've now implemented arrays.
Adding new heap types is also pretty straightforward, just follow the same process
as we did when adding the `Array` type.
You can pretty easily implement maps (hashtables), strings and many other data structures like this.

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

Lets first talk about the packed string, as its the simpler concept.
The packed string is simply a special short encoded string type which refers
to strings that are exactly 6 bytes in length.

The reason the bytes are stored in reverse, with the first byte being stored in the
least significant byte, is because of the endianness of the target machine.
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
You might get the idea of setting the unused bytes to 0, effectively storing the string
as a null-terminated sequence of bytes.
I've choosen not to do that, because I want to be able to pass around null bytes as actual data.

I'll leave the implementation of these two types as an exercise to the reader.
If you don't want to figure this out yourself, you can go check out the source code
for my own programming language Charly, the github link is at the end of this article.

## Alternatives

Another viable alternative to using tagged-unions is a technique called pointer tagging.
Pointer tagging relies on the fact that all regularly allocated pointers are aligned to
8 bytes.
To find out how exactly pointer-tagging works, I will kindly redirect you to my friend Max's blog.
He has a great series going on where he implements a Lisp to x86 compiler, from scratch, in C.
The following two articles contain his implementation of pointer tagging.

- [Compiling a Lisp: Integers](https://bernsteinbear.com/blog/compiling-a-lisp-2/)
- [Compiling a Lisp: Booleans, characters, nil](https://bernsteinbear.com/blog/compiling-a-lisp-3/)

## Conclusion

I hope you found this article interesting and that it provided you with a basic understanding
of how NaN boxing works.
If you want to see an actual implementation of NaN boxing inside a language-runtime,
please check out my toy programming language [Charly](https://github.com/KCreate/charly-vm).

## Links

Source code:
- [nan-boxing.c](https://github.com/KCreate/leonardschuetz.ch/blob/master/server/resources/blog/200730_nanboxing/nan-boxing.c)
- [tagged-union.c](https://github.com/KCreate/leonardschuetz.ch/blob/master/server/resources/blog/200730_nanboxing/tagged-union.c)

Other stuff:
- [@mechantecerises IG (Header Graphic)](https://www.instagram.com/mechantecerises)
- [Charly Programming Language](https://github.com/KCreate/charly-vm)
- [Max Bernsteins Blog](https://bernsteinbear.com)
