# Segar

Convert 1 dimensional arrays to segments.

## Show me code

###### Convert an array to segments
```javascript
const test = [1,2,3,4,5,6,7,8,9];
// [1,2,3,4,5,6,7,8,9]

test = arrayToSegments(test, 3);
// [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

test = segmentsToArray(test);
// [1,2,3,4,5,6,7,8,9]
```

###### Convert a string to segments with 4 fields
```javascript
const message = "Hello World!";
const segments = arrayToSegments(message, 4, (char) => (
    char.charCodeAt(0)
));
/*
[ [72, 101, 108, 108],
  [111, 32, 87, 111],
  [114, 108, 100, 33] ]
*/
```

## License
The MIT License (MIT)
Copyright (c) 2016 Leonard Schütz

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
