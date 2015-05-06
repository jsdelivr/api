'use strict';

var async = require('async')
  , url = require('url')
  , _ = require('lodash')
  , request = require('request')

  , config = require('../config');

var db = config.db;

module.exports = function (dbs, cb) {

  async.eachSeries(config.cdns, function (cdn, next) {

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

      var schemaKeys = Object.keys(dbs._schema);
      var collection = dbs[cdn];

      async.each(libraries, function (library, done) {

        // create the db item by selecting desired values from synced data and filling in absent data w/ defaults
        var item = _.pick(library, schemaKeys);
        _.each(schemaKeys, function(key) {
          if(!item[key])
            item[key] = dbs._schema[key];
        });

        // only insert if the item does not currently exist
        var name = library.name || null;
        if(name) {
          var _item = collection.findOne({"name":name});
          if(!_item) {
            collection.insert(item);
          }
          else {
            _.each(item, function(v,k) {
              _item[k] = v;
            });
            collection.update(_item);
          }
        }

        done();
      }, function (err) {
        if (err) {
          return next(err);
        }

        console.log('Synced', cdn);
        next();
      });
    });
  }, cb);
};
