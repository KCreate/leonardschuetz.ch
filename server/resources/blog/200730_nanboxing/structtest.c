#include <stdio.h>
#include <stdint.h>
#include <string.h>

// Our short value type
typedef uint64_t VALUE;
typedef char bool;

// Masks for important segments of a float value
const uint64_t MASK_SIGN        = 0x8000000000000000;
const uint64_t MASK_EXPONENT    = 0x7ff0000000000000;
const uint64_t MASK_QUIET       = 0x0008000000000000;
const uint64_t MASK_TYPE        = 0x0007000000000000;
const uint64_t MASK_SIGNATURE   = 0xffff000000000000;
const uint64_t MASK_PAYLOAD_PTR = 0x0000ffffffffffff;
const uint64_t MASK_PAYLOAD_INT = 0x00000000ffffffff;

// Type IDs for short encoded types
const uint64_t MASK_TYPE_NAN     = 0x0000000000000000;
const uint64_t MASK_TYPE_FALSE   = 0x0001000000000000;
const uint64_t MASK_TYPE_TRUE    = 0x0002000000000000;
const uint64_t MASK_TYPE_NULL    = 0x0003000000000000;
const uint64_t MASK_TYPE_INTEGER = 0x0004000000000000;
const uint64_t MASK_TYPE_PSTRING = 0x0005000000000000;
const uint64_t MASK_TYPE_VSTRING = 0x0006000000000000;

// Constant short encoded values
const uint64_t kNaN   = MASK_EXPONENT | MASK_QUIET;
const uint64_t kFalse = kNaN | MASK_TYPE_FALSE;
const uint64_t kTrue  = kNaN | MASK_TYPE_TRUE;
const uint64_t kNull  = kNaN | MASK_TYPE_NULL;

// Integer encoding / decoding
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


// Pointer encoding / decoding
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

// Packed String encoding / decoding

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

// Testing
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
