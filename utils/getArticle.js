import get from "./get";


/**
 * categoryList
 *
 * @param  {string} category - Name of the category being requested
 * @param  {function} callback - callback function receiving the results
 */
function categoryList(category, callback) {
    get("/resources/" + category + "/", "GET", { noCache: true }, (err, res) => {
        if (err) throw err;

        let directory;
        try {
            directory = JSON.parse(res);
        } catch (e) {
            directory = [];
        }

        if (directory.ok === false) {
            callback(false);
        } else {
            callback(directory);
        }
    });
};
module.exports.categoryList = categoryList;

/**
 * articlesList
 *
 * @param  {string} category - Name of the category being requested
 * @param  {string} name     - Name of the article being requested
 * @param  {function} callback - callback function receiving the results
 */
function articlesList(category, name, callback) {
    get("/resources/" + category + "/" + name + "/", "GET", { noCache: true }, (err, res) => {
        if (err) throw err;

        let directory;
        try {
            directory = JSON.parse(res);
        } catch (e) {
            directory = [];
        }

        if (directory.ok === false) {
            callback(false);
        } else {
            callback(directory);
        }
    });
};
module.exports.articlesList = articlesList;

/**
 * getFile
 *
 * @param  {string} category - Name of the category being requested
 * @param  {string} name     - Name of the article being requested
 * @param  {string} file     - Name of the file being requested
 * @param  {function} callback - callback function receiving the results
 */
function getFile(category, name, file, callback) {
    get("/resources/" + category + "/" + name + "/" + file, "GET", { noCache: true }, (err, res, xhr) => {
        if (err) throw err;

        if (xhr.status === 404) {
            return callback(false);
        }

        callback(res);
    });
};
module.exports.getFile = getFile;

/**
 * getArticle
 *
 * @param  {string} category - Name of the category being requested
 * @param  {string} name     - Name of the article being requested
 * @param  {string} file     - Mame of the file being requested
 * @param  {function} callback - callback function receiving the results
 */
function getArticle(category, name, file, callback) {

    if (category !== undefined && name !== undefined && file !== undefined) {
        getFile(category, name, file, callback);
    }

    if (category !== undefined && name !== undefined) {
        articlesList(category, name, callback);
    }

    if (category !== undefined) {
        categoryList(category, name, callback);
    }

    return callback(false);
};
module.exports.getArticle = getArticle;
