module.exports = (context) => {

    // Import libraries and other routes
    const express       = context.express;
    const path          = context.path;
    const auth          = context.auth;
    const fs            = context.fs;
    const production    = context.production;
    const morgan        = context.morgan;
    const compression   = context.compression;
    const bodyParser    = context.bodyParser;
    const app           = context.app;
    const loggingStream = context.loggingStream;
    const expressWs     = context.expressWs;
    const webpackDevMiddleware = context.webpackDevMiddleware;
    const webpackHotMiddleware = context.webpackHotMiddleware;

    // Configuration
    app.enable('strict routing');
    app.disable('x-powered-by');
    app.use(compression());

    // Middlewares
    app.use(morgan('combined', {
        stream: loggingStream,
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(auth.router);

    // Content routes
    app.use('/resources', require('./resources.js'));
    app.use('/d/:file', (req, res) => res.redirect('/resources/documents/' + req.params.file));
    app.use('/apps', require('./apps.js'));
    app.use('/todosapi', auth.requiresAuthentication, require('./todos/index.js'));
    app.use('/documents', auth.requiresAuthentication, require('./documents.js'));    
    app.use('/livechatapi', (req, res, next) => {
        req.expressWs = expressWs;
        next();
    }, require('./livechat/route.js'));
    app.use('/tbz-va-2016', express.static(path.resolve(__dirname, './resources/documents/tbz-va-2016/')));

    // If in development, include webpack middlewares
    if (!production) {
        app.use(webpackDevMiddleware);
        app.use(webpackHotMiddleware);
    }

    // All other routes are being handled by react-router
    app.use(express.static('./dist'));
    app.use('/', (req, res) => {
        if (production) {
            res.sendFile(path.resolve('./dist/index.html'));
        } else {
            res.sendFile(path.resolve('./client/app/index.html'));
        }
    });

    return app;
};
