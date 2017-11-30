// Dependencies
const express       = require("express");
const path          = require("path");
const fs            = require("fs");
const bodyParser    = require("body-parser");
const compression   = require("compression");
const morgan        = require("morgan");
const auth          = require("./auth.js");
const websocket     = require("express-ws");
const vhost         = require("vhost");
const app           = express();

/*
 * Initialize webpack related middlewares
 * */
const webpackConfig = require("../webpack.config.js");
let webpack;
let webpackDevMiddleware = () => undefined;
let webpackHotMiddleware = () => undefined;
let compiler;
if (!webpackConfig.production) {
    webpack               = require("webpack");
    webpackDevMiddleware  = require("webpack-dev-middleware");
    webpackHotMiddleware  = require("webpack-hot-middleware");
    compiler              = webpack(webpackConfig);
}

/*
 * Load config
 * */
const config        = require("./config.json");
const portPROD      = config.portPROD;
const portDEV       = config.portDEV;
const port          = webpackConfig.production ? portPROD : portDEV;

/*
 * App configuration
 * The app is not being reassigned, because the app is being passed by reference
 * */
require("./routes.js")({
    express,
    path,
    fs,
    auth,
    morgan,
    compression,
    bodyParser,
    app,
    loggingStream: fs.createWriteStream(path.resolve(__dirname, "logs/", Date.now() + ".txt")),
    vhost,
    expressWs: websocket(app),
    production: webpackConfig.production,
    webpackDevMiddleware: webpackDevMiddleware(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath,
    }),
    webpackHotMiddleware: webpackHotMiddleware(compiler),
});

/*
 * Start listening on the pre-configured ports
 * */
console.log(`Starting express server on localhost:${port}`);
app.listen(port, "localhost", () => {
    console.log(`Express server listening on localhost:${port}`);
});
