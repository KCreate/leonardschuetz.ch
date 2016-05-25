// Dependencies
const express       = require('express');
const path          = require('path');
const bodyParser    = require('body-parser');
const morgan        = require('morgan');
const compression   = require('compression');

const app           = express();
const port          = 3000;

// Websocket setup
const expressWs     = require('express-ws')(app);

// Webpack dependencies, do not include in production
const webpackConfig = require('../webpack.config.js');
if (!webpackConfig.production) {
    const webpack               = require('webpack');
    const webpackDevMiddleware  = require('webpack-dev-middleware');
    const webpackHotMiddleware  = require('webpack-hot-middleware');
    const compiler              = webpack(webpackConfig);
}

// App configuration
app.enable('strict routing');
app.disable('x-powered-by');
app.use(compression());

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Redirect favicon.ico to favicon.png
app.use((req, res, next) => {
    if (req.originalUrl !== '/favicon.ico') {
        return next();
    }

    // Redirect to favicon.png
    res.redirect('/favicon.png');
});

// Routes
app.use('/resources', require('./resources.js'));
app.use('/todosapi', require('./todos/index.js'));
app.use('/documents', require('./documents.js'));
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
    res.sendFile(path.resolve('./dist/index.html'));
});

// Listen
console.log('Starting express server on localhost:' + port);
app.listen(port, (err) => {
    if (err) throw err;
    console.log('Express server listening on localhost:' + port);
});
