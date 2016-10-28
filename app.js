/* global require, process */
console.log("Starting service");
var $ws = {};
$ws.express = require('express');
$ws.http = require('http');
$ws.app = $ws.express();
$ws.app.get('/', function (req, res) {
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end('{result:"ok"}');
            });
$ws.server = $ws.http.createServer($ws.app);
$ws.server.listen(19777);