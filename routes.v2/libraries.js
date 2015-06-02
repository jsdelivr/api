/**
 * Created by austin on 5/20/15.
 */

"use strict";

var router = new require("express").Router()
  , _ = require("lodash")

  , dbs = require("../db")
  , api = require("../lib/api.v2")
  , api = require("../lib/api.v1");

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
    , collection = dbs[cdn];

  if (collection) {
    req.collection = collection;
    next();
  }
  else {
    var error = new Error("Invalid CDN requested: " + cdn);
    error.code = 400;
    _sendResult(error, {}, req, res);
  }
});

router.get("/:cdn/libraries", function (req, res) {

  api.processRequest(req.collection, req.query, api.actions.find, function (err, result) {
    _sendResult(err, result, req, res);
  });
});

router.get("/:cdn/libraries/:name", function (req, res) {

  req.query.name = req.params.name;

  api.processRequest(req.collection, req.query, api.actions.findOne, function (err, result) {
    _sendResult(err, result, req, res);
  });
});

router.get("/:cdn/libraries/:name/:version", function (req, res) {

  req.query.name = req.params.name;
  req.query.version = req.params.version;

  api.processRequest(req.collection, req.query, api.actions.findOne, function (err, result) {
    _sendResult(err, result, req, res);
  });
});

module.exports = router;
