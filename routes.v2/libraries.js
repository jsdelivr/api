/**
 * Created by austin on 5/20/15.
 */

'use strict';

var router = new require('express').Router()
  , _ = require('lodash')

  , utils = require("./utils")
  , config = require('../config')
  , dbs = require('../db')
  , api_v2 = require('../lib/api.v2');

function _eTagCheck(req, res, next) {

  var etagHeader = 'if-none-match';
  if (req.headers[etagHeader]) {

    var etagsCollection = dbs[config.etagsCollection]
      , cdnCache = etagsCollection.findOne({'cdn': req.collection.name}) || {etags: []}
      , etagObj = _.find(cdnCache.etags, {etag: req.headers[etagHeader]});

    if (etagObj) {
      res.status(304).end();
    }
    else {
      next();
    }
  }
  else {
    next();
  }
}

router.param('cdn', function (req, res, next) {

  // normalize cdn case for collection existense check
  var cdn = String(req.params.cdn).toLowerCase()
    , collectionConfig = _.find(config.cdnCollections, function (collectionConfig) {
      return (collectionConfig.name === cdn || _.includes(collectionConfig.aliases, cdn))
    });

  if (collectionConfig) {
    req.collection = dbs[collectionConfig.name];
    next();
  }
  else {
    var error = new Error('Invalid CDN requested: ' + cdn);
    error.code = 400;
    utils.sendResult(error, {}, req, res);
  }
});

router.get('/:cdn/libraries', function (req, res) {
  api_v2.processRequest(req.collection, req.query, api_v2.actions.find, false, function (err, result) {
    utils.sendResult(err, result, req, res);
  });
});

router.get('/:cdn/libraries/:name', function (req, res) {
  req.query.name = req.params.name;

  api_v2.processRequest(req.collection, req.query, api_v2.actions.find, false, function (err, result) {
    utils.sendResult(err, result, req, res);
  });
});

router.get('/:cdn/library', [_eTagCheck], function (req, res) {

  api_v2.processRequest(req.collection, req.query, api_v2.actions.findOne, false, function (err, result) {
    utils.sendResult(err, result, req, res);
  });
});

router.get('/:cdn/library/:name', [_eTagCheck], function (req, res) {

  req.query.name = req.params.name;

  api_v2.processRequest(req.collection, req.query, api_v2.actions.findOne, true, function (err, result) {
    utils.sendResult(err, result, req, res);
  });
});

router.get('/:cdn/library/:name/:version', [_eTagCheck], function (req, res) {

  req.query.name = req.params.name;
  req.query.version = req.params.version;

  api_v2.processRequest(req.collection, req.query, api_v2.actions.findOne, true, function (err, result) {
    utils.sendResult(err, result, req, res);
  });
});

module.exports = router;
