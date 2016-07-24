// Dependencies
const express       = require('express');
const path          = require('path');
const fs            = require('fs');
const bodyParser    = require('body-parser');
const compression   = require('compression');
const morgan        = require('morgan');
const auth          = require('./auth.js');
const http          = require('http');
const https         = require('https');
const websocket     = require('express-ws');
const app           = express();

/*
 * Load config
 * */
const config        = require('./config.json');
const portHTTP      = config.portHTTP;
const portPROD      = config.portPROD;
const portDEV       = config.portDEV;

/*
 * Initialize webpack related middlewares
 * */
const webpackConfig = require('../webpack.config.js');
let webpack;
let webpackDevMiddleware = ()=>undefined;
let webpackHotMiddleware = ()=>undefined;
let compiler;
if (!webpackConfig.production) {
    webpack               = require('webpack');
    webpackDevMiddleware  = require('webpack-dev-middleware');
    webpackHotMiddleware  = require('webpack-hot-middleware');
    compiler              = webpack(webpackConfig);
}

/*
 * Configure the server
 *
 * In production, use HTTPS
 * In development, use HTTP
 * */
let server;
if (webpackConfig.production) {
    const credentials = {
        key: fs.readFileSync(config.privateKey, 'utf8'),
        cert: fs.readFileSync(config.certificate, 'utf8'),
    };
    server = https.createServer(credentials, app);
} else {
    server = http.createServer(app);
}

/*
 * App configuration
 * The app is not being reassigned, because the app is being passed by reference
 * */
require('./routes.js')({
    express,
    path,
    fs,
    auth,
    morgan,
    compression,
    bodyParser,
    app,
    loggingStream: fs.createWriteStream(path.resolve(__dirname, 'logs/', Date.now() + '.txt')),
    expressWs: websocket(app, server),
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
console.log('Starting express server on localhost');
console.log(webpackConfig);
if (webpackConfig.production) {
    server.listen(portPROD, () => {
        console.log('Express server listening on localhost:' + portPROD);
    });

    // HTTP to HTTPS redirection
    http.createServer((req, res) => {
        res.writeHead(301, {
            Location: 'https://leonardschuetz.ch' + req.url,
        });
        res.end();
    }).listen(portHTTP, () => {
        console.log('HTTP to HTTPS redirection listening on localhost:' + portHTTP);
    });
} else {
    server.listen(portDEV, () => {
        console.log('Express server listening on localhost:' + portDEV);
    });
}

