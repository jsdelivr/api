#!/usr/bin/env node
'use strict';

var express = require('express')
  , morgan = require('morgan')
  , async = require('async')
  , _ = require('lodash')

  , dbs = require('./db')
  , config = require('./config')
  , logger = require('./lib/logger');

var db = config.db
  , taskUpdating = {};

module.exports = function main(cb) {

  async.series([
    init,
    serve,
    runTasks
  ], function (err) {

    if (err) {
      logger.err(`Error starting application!`);
      logger.err(err);
      process.exit();
    }
    else if (cb)
      cb();
  });
};

var intervalSet = false;
function runTasks(cb) {
  logger.info('Running tasks');

  // first kick off the tasks
  async.eachSeries(Object.keys(config.tasks), function (name, done) {
    taskUpdating[name] = false;
    runTask(name, done);
  }, function (err) {

    if (err) {
      logger.err('Error initializing tasks');
      logger.err(err);
    }

    //then set the interval
    if (!intervalSet) {
      intervalSet = true;
      var interval = 6 * (10 * 1e4);

      // we want to space out the start of each sync cycle by 10 minutes each
      setInterval(function () {
        runTasks(function () {
          logger.info('libraries synced!');
          return true;
        });
      }, interval);
    }

    if (cb) cb();
  });
}

function runTask(name, cb) {

  if(!taskUpdating[name]) {
    taskUpdating[name] = true;
    logger.info(`running task... ${name}`);

    try {
      require('./tasks/' + name + '.js')(dbs, function (err) {

        if (err) {
          logger.err(`Error in task ${name}`);
          logger.err(err);
        }
        else
          logger.info(`Task ${name} complete`);

        // don't wait for the cache to be cleared
        taskUpdating[name] = false;
        cb();

        logger.info('Purging cache');

        var purgeCache = require('./lib/purge')(config.maxcdn);
        purgeCache(function (err) {
          if (err) {
            return logger.err(err);
          }

          logger.info('Cache purged');
        });
      });
    } catch (e) {
      logger.err(e);
      cb();
    }
  }
  else {
    logger.info(`Task ${name} is already running`);
    cb();
  }
}

function serve(cb) {
  cb = cb || _.noop;

  var app = express()
    , port = config.port;

  // set global sql client
  var KNEX = global.KNEX = require("./db/knex");

  app.use(morgan('dev'));
  app.set('json spaces', 2);

  // setup CORS
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });

  // v1 routes
  app.use('/v1', require('./routes.v1/libraries'));

  // v2 routes
  app.use('/v2/analytics', require('./routes.v2/analytics'));
  app.use('/v2', require('./routes.v2/libraries'));

  // catch all
  app.all('*', function (req, res) {
    res.status(404).jsonp({status: 404, message: 'Requested url ' + req.url + ' not found.'});
  });

  app.listen(port, function () {
    logger.info(`Node (version: ${process.version}) ${process.argv[1]} started on ${port} ...`);
    cb();
  });

  return app;
}

function init(cb) {

  process.on('exit', terminator);

  ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
    'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
  ].forEach(function(element) {
      process.on(element, function() { terminator(element); });
    });

  cb();
}

function terminator(sig) {

  // close loki db
  dbs._db.close();

  if (typeof sig === 'string') {
    logger.info(`${sig}: Received ${new Date()} - terminating Node server ...`);

    process.exit(1);
  }

  logger.info(`${new Date()}: Node server stopped.`);
}
