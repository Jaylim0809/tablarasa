#!/usr/bin/env node

/**
 * Module dependencies.
 */
const app = require('./app');
const debug = require('debug')('myapp:server');
const http = require('http');
const config = require('./config.json').development

const webSocket = require('./public/js/fabric/socket');

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const port = normalizePort(config.PORT || process.env.PORT || '8003');

//var server = http.createServer(app);

mongoose.connect(config.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true, 
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        /**
         * Get port from environment and store in Express.
         */
        console.log('db 접속에 성공하였습니다.');
        
        app.set('port', port);
        /**
         * Create HTTP server.
         */
        server = http.createServer(app);
        /**
         * Listen on provided port, on all network interfaces.
         */
        server.listen(port, () => {
            console.log('server on ' + port)
        });
        webSocket(server, app);
        server.on('error', onError);
        server.on('listening', onListening);

    })
    .catch((err) => {
        console.log('연결 실패', err);
        process.exit(1)
    });

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
}