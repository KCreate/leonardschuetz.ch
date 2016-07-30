const httpProxy = require('http-proxy');
const http = require('http');
const fs = require('fs');
const config = require('./config.json');
const production = require('../webpack.config.js').production || process.argv[2] === 'production';

const proxyConfig = config.proxy;
if (production) {
    console.log('Applying ssl info');
    proxyConfig.ssl = {
        key: fs.readFileSync(config.privateKey, 'utf8'),
        cert: fs.readFileSync(config.certificate, 'utf8'),
    };
}

const proxy = httpProxy.createProxyServer(proxyConfig).listen(config.portPROXY);

/*
const proxyServer = http.createServer((req, res) => {
    proxy.web(req, res);
});

proxyServer.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

proxyServer.listen(config.portPROXY);
*/
