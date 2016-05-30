/* eslint-disable no-var */

// Dependencies
const express       = require('express');
var expressWs     = require('express-ws'); // Has to be reassigned later
const path          = require('path');
const fs            = require('fs');
const bodyParser    = require('body-parser');
const morgan        = require('morgan');
const compression   = require('compression');
const auth          = require('./auth.js');

const app           = express();
const port          = 3000;
const portProduction = 443;

// Webpack dependencies, not required on production
const webpackConfig = require('../webpack.config.js');
if (!webpackConfig.production) {
    const webpack               = require('webpack');
    const webpackDevMiddleware  = require('webpack-dev-middleware');
    const webpackHotMiddleware  = require('webpack-hot-middleware');
    const compiler              = webpack(webpackConfig);
}

// HTTPS Configuration
if (webpackConfig.production) {
    const https         = require('https');
    const privateKey    = fs.readFileSync('/etc/letsencrypt/archive/leonardschuetz.ch/privkey2.pem', 'utf8');
    const certificate   = fs.readFileSync('/etc/letsencrypt/archive/leonardschuetz.ch/cert2.pem', 'utf8');
    const credentials   = {
        key: privateKey,
        cert: certificate,
    };

    // Create the https server
    const server = https.createServer(credentials, app);

    // Apply the express-ws constructor to the app using the server
    expressWs = expressWs(app, server);
} else {

    // Apply the express-ws constructo the app
    expressWs = expressWs(app);
}

// App configuration
app.enable('strict routing');
app.disable('x-powered-by');
app.use(compression());

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication
app.use(auth.router);

// Routes
app.use('/resources',   require('./resources.js'));
app.use('/todosapi',    require('./todos/index.js'));
app.use('/documents',   auth.requiresAuthentication, require('./documents.js'));
app.use('/menu',        require('./menu.js'));
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
