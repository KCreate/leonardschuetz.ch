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
  TYPE_NULL,
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
    int64_t as_integer;
    double  as_float;
    bool    as_bool;
    Array   as_array;
  };
} Value;

// Recursive print function for the value container
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

// Allocates a new Value struct and assigns it the given type
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

  Value* array = create_array((Value**)values, 4);

  print_value(array);

  return 0;
}
