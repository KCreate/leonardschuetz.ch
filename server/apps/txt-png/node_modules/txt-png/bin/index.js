#!/usr/bin/env node

// Dependencies
const savePixels            = require('save-pixels');
const package               = require('../package.json');
const ArgumentParser        = require('argparse').ArgumentParser;

// App specific
const textToRGBData         = require('../lib/textToRGBData.js');
const imageBufferToText     = require('../lib/imageBufferToText.js');

// Argument parsing
const parser = new ArgumentParser({
    version: package.version,
    addhelp: true,
    description: package.description
});
parser.addArgument(
    '-t',
    {
        help: 'Encode or decode.',
        defaultValue: 'encode',
        choices: ['encode', 'decode'],
        dest: 'type'
    }
);

const argv = parser.parseArgs();

// stdin parsing
let stdin = new Buffer.alloc(0);
process.stdin.resume();
process.stdin.on('data', (buffer) => {
    stdin = Buffer.concat([stdin, buffer]);
});
process.stdin.on('end', () => {

    switch (argv.type) {
        case 'encode': {
            stdin = stdin.toString();
            savePixels(textToRGBData(stdin), "png").pipe(process.stdout);
            break;
        }
        case 'decode': {
            imageBufferToText(stdin, 'image/png', (pixels) => {
                process.stdout.write(String.fromCharCode.apply(null, pixels.data));
            });
            break;
        }
    }

});
