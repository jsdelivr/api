#!/usr/bin/env node
'use strict';

require('log-timestamp');

var async = require('async');
var express = require('express');
var taskist = require('taskist');
var sugars = {
    mongo: require('mongoose-sugar'),
    object: require('object-sugar')
};

var config = require('./config');
var schemas = require('./schemas')({
    cdns: config.cdns
});
var tasks = require('./tasks')({
    sugars: sugars,
    schemas: schemas
});
var api = require('./api')(sugars.object, config.cdns, schemas.object);


if(require.main === module) {
    main();
}

module.exports = main;
function main(cb) {
    cb = cb || noop;

    var mongoUrl = sugars.mongo.parseAddress(config.mongo);

    console.log('Connecting to databases');

    async.parallel([
        sugars.mongo.connect.bind(null, mongoUrl),
        sugars.object.connect.bind(null, 'db')
    ], function(err) {
        if(err) {
            return console.error('Failed to connect to database', err);
        }

        console.log('Connected to databases');

        console.log('Initializing tasks');
        initTasks();

        console.log('Starting server');
        serve(cb);
    });
}

function initTasks() {
    taskist(config.tasks, tasks, {
        instant: true
    });
}

function serve(cb) {
    cb = cb || noop;

    var app = express();
    var port = config.port;

    app.configure(function() {
        app.set('port', port);

        app.disable('etag');

        app.use(express.logger('dev'));

        app.use(app.router);
    });

    app.configure('development', function() {
        app.use(express.errorHandler());
    });

    api(app);

    process.on('exit', terminator);

    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
    'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
    ].forEach(function(element) {
        process.on(element, function() { terminator(element); });
    });

    app.listen(port, function() {
        console.log('Node (version: %s) %s started on %d ...', process.version, process.argv[1], port);

        cb(null);
    });
}

function terminator(sig) {
    if(typeof sig === 'string') {
        console.log('%s: Received %s - terminating Node server ...',
            Date(Date.now()), sig);

        process.exit(1);
    }

    console.log('%s: Node server stopped.', Date(Date.now()) );
}

function noop() {}

