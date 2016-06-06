const arrayToSegments = require('./index.js').arrayToSegments;
const segmentsToArray = require('./index.js').segmentsToArray;

const message = "Hello World!";
const segments = arrayToSegments(message, 4, (char) => (
    char.charCodeAt(0)
));

console.log(segments);

const decodedSegments = segmentsToArray(segments, (char) => (
    String.fromCharCode(char)
)).join('');

// Test runner on a budget
if (decodedSegments == message) {
    console.log('[ OK ] Test passed!');
    process.exit(0);
} else {
    console.log('[ FAIL ] Test failed!');
    process.exit(1);
}
