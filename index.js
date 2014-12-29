//Library dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var winston = require('winston');
var infoLogger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)(),
            new (winston.transports.File)({ 
            	filename: 'logs/info.log',
            	maxsize: 1000000
            })
        ]
    });

//Local dependencies
var GasSensor = require('./lib/gas-sensor');
var gasSensor = new GasSensor("A0", infoLogger);
var Bridge = require('./routes/bridge');
var bridge = new Bridge(io, gasSensor, infoLogger);
var handler = require('./routes/handler')(app, express, path, io, gasSensor, __dirname);

//Web server
http.listen(3000, function () {
  infoLogger.log('info', 'Web server initiated.');
});