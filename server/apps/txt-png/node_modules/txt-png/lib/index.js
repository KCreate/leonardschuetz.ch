const savePixels            = require('save-pixels');
const textToRGBData         = require('../lib/textToRGBData.js');
const imageBufferToText     = require('../lib/imageBufferToText.js');
const streamToBuffer        = require('stream-to-buffer');

module.exports = {


    /**
     * Converts a string into a png buffer
     *
     * @param  {string} text - The message to encode into the png
     * @param  {function} callback - Receives the buffer
     */
    textToImageBuffer(text, callback) {
        const imageStream = savePixels(textToRGBData(text), 'png');
        streamToBuffer(imageStream, (err, buffer) => {
            if (err) throw err;

            callback(buffer);
        });
    },


    /**
     * Converts a png buffer to a string
     *
     * @param {buffer} buffer - PNG buffer
     * @param {function} callback - Receives text
     */
    imageBufferToText(buffer, callback) {
        imageBufferToText(buffer, 'image/png', (pixels) => {
            let text = String.fromCharCode.apply(null, pixels.data);

            // Strip all null bytes
            while (text.indexOf('\0') != -1) {
                text = text.replace('\0', '');
            }

            callback(text);
        });
    }
};
