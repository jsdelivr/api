'use strict';

var async = require('async')
  , path = require('path')
  , url = require('url')
  , _ = require('lodash')
  , request = require('request')

  , config = require('../config');

var db = config.db;

module.exports = function (dbs, cb) {

  async.eachSeries(config.cdns, function (cdn, next) {
    _syncCDN(dbs, cdn, function (err) {
      // note the error but don't exit out of the loop,
      // it's okay to serve stale content if something goes wrong during the sync
      if (err) {
        console.log("Error syncing CDN %s", cdn, err);
      }
      next();
    });
  }, cb);
};

/**
 * sync all libraries for a given cdn from the remote api-sync instance via _syncLibrary
 *
 * @param dbs lokijs db instance
 * @param cdn name
 * @param cb
 * @private
 */
function _syncCDN(dbs, cdn, cb) {

  //attempt to get etags collection for this cdn
  var etagsCollection = dbs[config.etagsCollection]
    , cdnCache = etagsCollection.findOne({"cdn": cdn})
    , etags = cdnCache ? _.indexBy(cdnCache.etags || [], "path") : {};

  // get the remote cache file
  var _url = url.resolve(config.syncUrl, cdn + '.json');
  console.log('Starting to sync %s from source %s', cdn, _url);

  request.get(_url, {
    json: true
  }, function (err, res, remoteEtags) {

    if (err || !res) {
      return cb(err || new Error("Request to sync " + cdn + " from " + _url + " failed"));
    }
    else if (res.statusCode !== 200) {
      return cb(new Error("Request to sync " + cdn + " from " + _url + " failed"));
    }

    console.log('Files for sync of %s retrieved from source %s', cdn, _url);

    async.eachLimit(remoteEtags, 10, function (remoteEtag, done) {
      if (!etags[remoteEtag.path] || etags[remoteEtag.path].etag !== remoteEtag.etag) {
        // sync the library!
        _syncLibrary(dbs, cdn, remoteEtag.path, function (err) {

          // don't error out here,
          // all an error means is the api will serve stale content for a library
          // that may be mucked up on the api-sync side
          if (err) {
            console.error("Error syncing library!", err);
          }
          // update the running etag cache
          else {
            etags[remoteEtag.path] = remoteEtag;
          }

          done();
        });
      }
      else {
        // we're up to date, nothing to do here
        done();
      }
    }, function (err) {
      // update the etag collection if nothing drastic has happened
      if (!err) {
        _upsertCDNEtags(etagsCollection, cdn, etags);
      }
      cb(err);
    });
  });
}

/**
 * sync a single library json file from the api-sync instance
 *
 * @param dbs
 * @param cdnName
 * @param libraryName
 * @param cb
 * @private
 */
function _syncLibrary(dbs, cdnName, libraryName, cb) {

  // get the remote library file
  var _url = url.resolve(config.syncUrl, path.join(cdnName, libraryName, 'library.json'));

  request.get(_url, {
    json: true
  }, function (err, res, library) {

    if (err || !res) {
      return cb(err || new Error("Request to sync " + libraryName + " from " + _url + " failed"));
    }
    else if (res.statusCode !== 200) {
      return cb(new Error("Request to sync " + libraryName + " from " + _url + " failed"));
    }

    var schemaKeys = Object.keys(dbs._schema);
    var collection = dbs[cdnName];

    // create the db item by selecting desired values from synced data and filling in absent data w/ defaults
    var item = _.pick(library, schemaKeys);
    _.defaults(item, dbs._schema);

    // only insert if the item does not currently exist
    var name = library.name || null;
    if (name) {
      var _item = collection.findOne({"name": name});
      if (!_item) {
        collection.insert(item);
      }
      else {
        _.extend(_item, item);
        collection.update(_item);
      }

      // clean up
      item = null;
    }

    // and return
    cb();
  });
}

/**
 * refreshes the current CDN etags cache w/ the successfully synced libraries remote etag data
 *
 * @param etagsCollection
 * @param cdn
 * @param etags
 * @private
 */
function _upsertCDNEtags(etagsCollection, cdn, etags) {

  var _cdnCache = etagsCollection.findOne({"cdn": cdn})
    , cdnEtags = {cdn: cdn};

  cdnEtags.etags = _.map(etags, function (etag) {
    return etag;
  });

  if (!_cdnCache) {
    etagsCollection.insert(cdnEtags);
  }
  else {
    cdnEtags.meta = _cdnCache.meta;
    cdnEtags.$loki = _cdnCache.$loki;
    etagsCollection.update(cdnEtags);
  }
}
