const { arrayToSegments } = require('segar');
const zeros                 = require('zeros');


/**
 * Turns a string into a png-encodable array
 *
 * @param  {string} message - The message to encode
 * @return {object} ndarray - containing the pixel data
 */
function textToRGBData(message) {
    message = arrayToSegments(message, 4, (char) => (
        Math.min(char.charCodeAt(0), 255)
    ));

    const IMAGE_WIDTH = Math.ceil(Math.sqrt(message.length));
    const rgb_data = zeros([IMAGE_WIDTH, IMAGE_WIDTH, 4]);
    message.forEach((segment, segIndex) => {
        const height = Math.floor(segIndex / IMAGE_WIDTH);
        const width = segIndex % IMAGE_WIDTH;

        segment.forEach((value, index) => {
            rgb_data.set(width, height, index, value);
        });
    });

    return rgb_data;
}

module.exports = textToRGBData;
