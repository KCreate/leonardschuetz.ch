const getPixels = require('get-pixels');

/**
 * Converts a image buffer to text
 *
 * @param  {buffer} buffer - The buffer to decode
 * @param  {string} mimetype - The mimetype of the image
 * @param  {function} callback - Receives pixel data as an ndarray
 */
function imageBufferToText(buffer, mimetype, callback) {
    getPixels(buffer, mimetype, (err, pixels) => {
        if (err) throw err;
        callback(pixels);
    });
}

module.exports = imageBufferToText;
