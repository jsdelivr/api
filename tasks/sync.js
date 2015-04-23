'use strict';

var async = require('async')
  , url = require('url')
  , request = require('request')
  , prop = require('annofp').prop
  , config = require('../config');

var db = config.db;

module.exports = function (sugar, schemas, cb) {

  async.eachSeries(config.cdns, function (cdn, cb) {

    var _url = url.resolve(config.syncUrl, cdn + '.json');
    console.log('Starting to sync %s from source %s', cdn, _url);

    request.get(_url, {
      json: true
    }, function (err, res, libraries) {

      if (err || !res) {
        return cb(err || new Error("Request to sync " + cdn + " from " + _url + " failed"));
      }
      else if (res.statusCode !== 200) {
        return cb(new Error("Request to sync " + cdn + " from " + _url + " failed"));
      }

      var schema = schemas[cdn + 'Library'];

      async.each(libraries, function (library, cb) {

        sugar.getOrCreate(schema, {
          name: library.name
        }, function (err, d) {
          if (err) {
            console.log("error getting or creating", library.name);
            return cb(err);
          }

          sugar.update(schema, d._id, library, cb);
        });
      }, function (err) {
        if (err) {
          return cb(err);
        }

        removeExtras(sugar, schema, libraries.map(prop('name')), function (err) {

          if (err) {
            return cb(err);
          }

          console.log('Synced', cdn);
          cb();
        });
      });
    });
  }, cb);
};

function removeExtras(sugar, schema, retained, cb) {

  sugar.getAll(schema, function (err, libraries) {
    if (err) {
      return cb(err);
    }

    async.each(libraries, function (library, cb) {
      if (retained.indexOf(library.name) === -1) {
        return sugar.remove(schema, library._id, {
          hard: true
        }, cb);
      }

      cb();
    }, cb);
  });
}
