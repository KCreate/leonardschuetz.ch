// Dependencies
const express       = require('express');
const path          = require('path');
const fs            = require('fs');
const bodyParser    = require('body-parser');
const compression   = require('compression');
const auth          = require('./auth.js');

let expressWs       = require('express-ws'); // Has to be reassigned later

const app           = express();
const port          = 3000;
const portProduction = 443;

const config        = require('./config.json');
const webpackConfig = require('../webpack.config.js');

// Stuff only needed in development
let morgan;
let webpack;
let webpackDevMiddleware;
let webpackHotMiddleware;
let compiler;
if (!webpackConfig.production) {

    // Webpack
    webpack               = require('webpack');
    webpackDevMiddleware  = require('webpack-dev-middleware');
    webpackHotMiddleware  = require('webpack-hot-middleware');
    compiler              = webpack(webpackConfig);

    // Additional dependencies
    morgan        = require('morgan');
}

// HTTPS Configuration
let https;
let privateKey;
let certificate;
let credentials;
let server;
if (webpackConfig.production) {
    https         = require('https');
    privateKey    = fs.readFileSync(config.privateKey, 'utf8');
    certificate   = fs.readFileSync(config.certificate, 'utf8');
    credentials   = {
        key: privateKey,
        cert: certificate,
    };

    // Create the https server
    server = https.createServer(credentials, app);
    expressWs = expressWs(app, server);
} else {
    expressWs = expressWs(app);
}

// App configuration
app.enable('strict routing');
app.disable('x-powered-by');
app.use(compression());

// Middleware
if (!webpackConfig.production) {
    app.use(morgan('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication
app.use(auth.router);

// Routes
app.use('/resources',   require('./resources.js'));
app.use('/d/:file',           (req, res) => {
    res.redirect('/resources/documents/' + req.params.file);
});
app.use('/apps',        require('./apps.js'));
app.use('/todosapi',    auth.requiresAuthentication, require('./todos/index.js'));
app.use('/documents',   auth.requiresAuthentication, require('./documents.js'));
app.use('/livechatapi', (req, res, next) => {
    req.expressWs = expressWs;
    next();
}, require('./livechat/route.js'));

// Webpack middleware, do not include in production
if (!webpackConfig.production) {
    app.use(webpackDevMiddleware(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath,
    }));
    app.use(webpackHotMiddleware(compiler));
}

// React front-page
app.use(express.static('./dist'));
app.use('/', (req, res) => {
    if (webpackConfig.production) {
        res.sendFile(path.resolve('./dist/index.html'));
    } else {
        res.sendFile(path.resolve('./client/app/index.html'));
    }
});

// Listen
console.log('Starting express server on localhost:' + port);

if (webpackConfig.production) {
    // Listen on a secured connection
    server.listen(portProduction);
} else {
    app.listen(port, (err) => {
        if (err) throw err;
        console.log('Express server listening on localhost:' + port);
    });
}

// Redirect all http to https
if (webpackConfig.production) {
    require('http').createServer((req, res) => {
        res.writeHead(301, {
            Location: 'https://leonardschuetz.ch' + req.url,
        });
        res.end();
    })
    .listen(80);
}
