/**
 * Created by austin on 5/20/15.
 */

"use strict";

var router = new require("express").Router()
  , _ = require("lodash")

  , config = require("../config")
  , dbs = require("../db")
  , api_v2 = require("../lib/api.v2");

function _sendResult(err, result, req, res) {

  if (err) {
    var error = {
      status: err.code || 500,
      message: err.message || err,
      url: req.url
    };
    res.status(error.status).json(error);
  }
  else {
    res.status(200).json(result);
  }
}

router.param("cdn", function (req, res, next) {

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
    var error = new Error("Invalid CDN requested: " + cdn);
    error.code = 400;
    _sendResult(error, {}, req, res);
  }
});

router.get("/:cdn/libraries", function (req, res) {
  api_v2.processRequest(req.collection, req.query, api_v2.actions.find, false, function (err, result) {
    _sendResult(err, result, req, res);
  });
});

router.get("/:cdn/library", function (req, res) {

  api_v2.processRequest(req.collection, req.query, api_v2.actions.findOne, false, function (err, result) {
    _sendResult(err, result, req, res);
  });
});

router.get("/:cdn/library/:name", function (req, res) {

  req.query.name = req.params.name;

  api_v2.processRequest(req.collection, req.query, api_v2.actions.findOne, true, function (err, result) {
    _sendResult(err, result, req, res);
  });
});

router.get("/:cdn/library/:name/:version", function (req, res) {

  req.query.name = req.params.name;
  req.query.version = req.params.version;

  api_v2.processRequest(req.collection, req.query, api_v2.actions.findOne, true, function (err, result) {
    _sendResult(err, result, req, res);
  });
});

module.exports = router;
