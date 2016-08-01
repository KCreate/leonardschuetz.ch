const http = require('http');
http.createServer((req, res) => {
    res.writeHead(302, {
        Location: 'https://leonardschuetz.ch/',
    });
    res.end();
}).listen(80);
