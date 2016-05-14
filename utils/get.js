/* eslint-disable no-param-reassign */
module.exports = function get(url, method, options, _callback) {

    // Allow the options to be optional
    if (typeof options == 'function') {
        _callback = options;
        options = {};
    }

    // Wrap the _callback
    function callback(err) {
        _callback(err, this.responseText);
    };

    // Standard XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    // Curry the callback
    xhr.addEventListener('load', callback.bind(xhr, undefined), false);
    xhr.addEventListener('abort', callback.bind(xhr, xhr), false);
    xhr.send(options.payload);

    // Abort after a timeout of 20 seconds or use the value set in the options
    setTimeout(() => {
        if (xhr.readyState !== 4) {
            xhr.abort();
        }
    }, options.timeout || 20000);
};
