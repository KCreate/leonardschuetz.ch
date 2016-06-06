# txt-png

[![npm version](https://badge.fury.io/js/txt-png.svg)](https://badge.fury.io/js/txt-png)

# Installation
```bash
npm install txt-png -g
```

## Encode
```bash
curl https://www.npmjs.com/package/txt-png | txt-png -t encode > output.png
```
This will pipe all the contents of the curl request into txt-png and produces a png file called __output.png__ that looks like this:

![](https://raw.githubusercontent.com/KCreate/pngencoder/master/example.png)

## Decode
```bash
cat output.png | txt-png -t decode > text.txt
```

# Programmatical use
See the [Example](https://github.com/KCreate/pngencoder/blob/master/test/main.js)

## What is this useful for?
I have absolutly no idea...

# License
The MIT License (MIT)
Copyright (c) <2016> [Leonard Schütz](https://leonardschuetz.ch/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
