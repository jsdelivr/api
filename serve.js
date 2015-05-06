#!/usr/bin/env node
'use strict';

require('log-timestamp');

var express = require('express')
  , morgan = require('morgan')
  , async = require('async')
  , _ = require('lodash')

  , dbs = require("./db")
  , config = require('./config');

var db = config.db
  , taskUpdating = {};

if (require.main === module) {
  main();
}

module.exports = main;
function main(cb) {

  async.series([
    serve,
    runTasks
  ], function (err) {

    if (err) {
      console.log("Error starting application!", err);
      process.exit();
    }
    else if (cb)
      cb();
  });
}

var intervalSet = false;
function runTasks(cb) {
  console.log('Running tasks');

  // first kick off the tasks
  async.eachSeries(Object.keys(config.tasks), function (name, done) {
    taskUpdating[name] = false;
    runTask(name, done);
  }, function (err) {

    if (err) console.error("Error initializing tasks", err);

    //then set the interval
    if (!intervalSet) {
      intervalSet = true;
      var interval = 6 * (5 * 1e4);

      // we want to space out the start of each sync cycle by 5 minutes each
      setInterval(function () {
        runTasks(function () {
          console.log("libraries synced!");
          return true;
        });
      }, interval);
    }

    if (cb)
      cb();
  });
}

function runTask(name, cb) {

  if(!taskUpdating[name]) {
    taskUpdating[name] = true;
    console.log("running task...", name);

    try {
      require("./tasks/" + name + ".js")(dbs, function (err) {

        if (err)
          console.error("Error in task ", name, err);
        else
          console.log("Task %s complete", name);

        // don't wait for the cache to be cleared
        taskUpdating[name] = false;
        cb();

        console.log('Purging cache');

        var purgeCache = require('./lib/purge')(config.maxcdn);
        purgeCache(function (err) {
          if (err) {
            return console.error(err);
          }

          console.log('Cache purged');
        });
      });
    } catch (e) {
      console.error(e);
      cb();
    }
  }
  else {
    console.log("Task %s is already running", name);
    cb();
  }
}

function serve(cb) {
  cb = cb || noop;

  var app = express()
    , port = config.port;

  app.use(morgan('dev'));

  // v1 routes
  app.use("/v1", require("./routes.v1/libraries"));

  app.listen(port, function () {
    console.log('Node (version: %s) %s started on %d ...', process.version, process.argv[1], port);
    cb();
  });
}

function terminator(sig) {
  if (typeof sig === 'string') {
    console.log('%s: Received %s - terminating Node server ...',
      Date(Date.now()), sig);

    process.exit(1);
  }

  console.log('%s: Node server stopped.', Date(Date.now()));
}

function noop() {
}

