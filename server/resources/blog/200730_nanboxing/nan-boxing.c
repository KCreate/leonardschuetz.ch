#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>

// Our short value type
typedef uint64_t VALUE;

// The type of the stored value
typedef enum {
  TYPE_INTEGER,
  TYPE_FLOAT,
  TYPE_BOOL,
  TYPE_NULL,
  TYPE_PSTRING,
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

// Masks for important segments of a float value
#define MASK_SIGN        0x8000000000000000
#define MASK_EXPONENT    0x7ff0000000000000
#define MASK_QUIET       0x0008000000000000
#define MASK_TYPE        0x0007000000000000
#define MASK_SIGNATURE   0xffff000000000000
#define MASK_PAYLOAD_PTR 0x0000ffffffffffff
#define MASK_PAYLOAD_INT 0x00000000ffffffff

// Type IDs for short encoded types
#define MASK_TYPE_NAN     0x0000000000000000
#define MASK_TYPE_FALSE   0x0001000000000000
#define MASK_TYPE_TRUE    0x0002000000000000
#define MASK_TYPE_NULL    0x0003000000000000
#define MASK_TYPE_INTEGER 0x0004000000000000
#define MASK_TYPE_PSTRING 0x0005000000000000

// Constant short encoded values
#define kNaN   (MASK_EXPONENT | MASK_QUIET)
#define kFalse (kNaN | MASK_TYPE_FALSE)
#define kTrue  (kNaN | MASK_TYPE_TRUE)
#define kNull  (kNaN | MASK_TYPE_NULL)

// Signatures of encoded types
#define SIGNATURE_NAN     kNaN
#define SIGNATURE_FALSE   kFalse
#define SIGNATURE_TRUE    kTrue
#define SIGNATURE_NULL    kNull
#define SIGNATURE_INTEGER (kNaN | MASK_TYPE_INTEGER)
#define SIGNATURE_PSTRING (kNaN | MASK_TYPE_PSTRING)
#define SIGNATURE_POINTER (kNaN | MASK_SIGN)

VALUE create_integer(int32_t value) {
  return SIGNATURE_INTEGER | (uint32_t)value;
}

int32_t decode_integer(VALUE value) {
  return value & MASK_PAYLOAD_INT;
}

VALUE create_float(double value) {
  return *(VALUE*)(&value);
}

double decode_float(VALUE value) {
  return *(double*)(&value);
}

VALUE create_pointer(HeapValue* ptr) {
  return SIGNATURE_POINTER | (uint64_t)ptr;
}

HeapValue* decode_pointer(VALUE value) {
  return (HeapValue*)(value & MASK_PAYLOAD_PTR);
}

bool IS_BIG_ENDIAN() {
  // Byte order in actual memory:
  //
  // Little-endian: 0x44 0x33 0x22 0x11
  // Big-endian:    0x11 0x22 0x33 0x44
  uint32_t check_number = 0x11223344;
  char first_byte = *(char*)(&check_number);
  return first_byte == 0x11;
}

// This method assumes that the input buffer has at least 6 bytes
// We do no bounds-checking at all, so be cautious!
VALUE create_packed_string(char* input) {
  VALUE value = SIGNATURE_PSTRING;
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
  uint64_t signature = value & MASK_SIGNATURE;
  if ((~value & MASK_EXPONENT) != 0) return TYPE_FLOAT;

  // Check for encoded pointer
  if (signature == SIGNATURE_POINTER) {
    HeapValue* ptr = decode_pointer(value);
    return ptr->type;
  }

  // Short encoded types
  switch (signature) {
    case SIGNATURE_NAN:     return TYPE_FLOAT;
    case SIGNATURE_FALSE:
    case SIGNATURE_TRUE:    return TYPE_BOOL;
    case SIGNATURE_NULL:    return TYPE_NULL;
    case SIGNATURE_INTEGER: return TYPE_INTEGER;
    case SIGNATURE_PSTRING: return TYPE_PSTRING;
  }

  return TYPE_NULL;
}

void print_value(VALUE value) {
  switch (get_type(value)) {
    case TYPE_INTEGER: {
      printf("%i", decode_integer(value));
      break;
    }

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

    case TYPE_PSTRING: {
      printf("%.6s", decode_packed_string(&value));
      break;
    }

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

    default: {
      printf("Unknown value type!");
    }
  }
}

int main() {
  VALUE v_int     = create_integer(-25);
  VALUE v_float   = create_float(-512.1234);
  VALUE v_bool    = kTrue;
  VALUE v_null    = kNull;
  VALUE v_pstring = create_packed_string("hello!");

  VALUE values[5] = { v_int, v_float, v_bool, v_null, v_pstring };
  VALUE v_array   = create_array(values, 5);

  print_value(v_array);

  return 0;
}
