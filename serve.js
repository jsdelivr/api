#!/usr/bin/env node
'use strict';

require('log-timestamp');

var express = require('express');
var _ = require('lodash');
var schedule = require('node-schedule');
var sugar = require('object-sugar');

var config = require('./config');
var schemas = require('./schemas')({
    cdns: config.cdns
});
var api = require('./api')(sugar, config.cdns, schemas.object);
var tasks = require('./tasks')({
    sugar: sugar,
    request: require('request'),
    url: config.syncUrl,
    cdns: config.cdns,
    schemas: schemas.object
});
var purgeCache = require('./lib/purge')(config.maxcdn);


if(require.main === module) {
    main();
}

module.exports = main;
function main(cb) {
    cb = cb || noop;

    console.log('Connecting to database');

    sugar.connect('db', function(err) {
        if(err) {
            return console.error('Failed to connect to database', err);
        }

        console.log('Connected to database');

        console.log('Initializing tasks');
        initTasks();

        console.log('Starting server');
        serve(cb);
    });
}

function initTasks() {
  console.log('Initializing tasks');

  _.each(Object.keys(config.tasks),function(name) {

    var pattern = config.tasks[name]
      ,  rule = new schedule.RecurrenceRule();

    rule.minute = new schedule.Range(0, 59, pattern.minute);

    schedule.scheduleJob(rule, function(name) {

      console.log("running task...",name,pattern);

      try
      {
        tasks[name](function(err) {
          if(err) {
            return console.error(err);
          }

          console.log('Purging cache');

          purgeCache(function(err) {
            if(err) {
              return console.dir(err);
            }

            console.log('Cache purged');
          });
        });
      } catch(e) {
        console.error(e);
      }
    }.bind(null,name));
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

