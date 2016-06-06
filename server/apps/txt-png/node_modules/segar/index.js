
/**
 * Convert an array to segments
 *
 * @param  {array, string} array
 * @param  {number} segmentSize, default is 4
 * @param  {function} callback - A function to apply to every item
 * @return {array}
 */
function arrayToSegments(array, segmentSize, callback) {

    // Allow the array to be a string
    if (array.constructor === String) {
        array = array.split('');
    }

    // Apply defaults
    segmentSize = segmentSize || 4;
    callback = callback || ((x) => x);

    // Error checking
    if (array.constructor !== Array) {
        throw TypeError('Expected Array, received: ' + typeof array);
    }
    if (segmentSize.constructor !== Number) {
        throw TypeError('Expected Number, received: ' + typeof segmentSize);
    }
    if (callback.constructor !== Function) {
        throw TypeError('Expected Function, received: ' + typeof callback);
    }

    // Convert to segments of the specified size
    const segments = array.reduce((last, current, index) => {
        index = Math.floor(index / segmentSize);

        // Create the segment if it doesn't exist
        if (!last[index]) last[index] = [];

        // Copy by value
        last = last.slice(0);

        // Append to the segment
        last[index].push(callback(current, index));

        return last;
    }, []);

    return segments;
}


/**
 * Converts segments to an array
 *
 * @param  {array} segments - The segments to decode
 * @param  {function} callback - A callback to apply to every item in the decoded array
 * @return {array}
 */
function segmentsToArray(segments, callback) {

    // Apply defaults
    callback = callback || ((x) => x);

    // Error checking
    if (segments.constructor !== Array) {
        throw TypeError('Expected Array, received: ' + typeof segments);
    }
    if (callback.constructor !== Function) {
        throw TypeError('Expected Function, received: ' + typeof callback);
    }

    // Flatten the array
    segments = [].concat.apply([], segments);

    // Apply the callback
    segments = segments.map(callback);

    return segments;
}

module.exports = {
    segmentsToArray,
    arrayToSegments,
};
