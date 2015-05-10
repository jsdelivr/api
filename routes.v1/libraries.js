/**
 * Created by austin on 5/5/15.
 */

"use strict";

var router = new require("express").Router()
  , _ = require("lodash")

  , dbs = require("../db")
  , api = require("../lib/api.v1");

function _sendResult(err, result, res) {

  if (err) {
    var error = {
      status: err.code || 500,
      message: err.message || err
    };
    res.status(err.code || 500).json(error);
  }
  else {
    res.status(200).json(result);
  }
}

function _buildActionParams(query) {

  var queryFields = ["name", "zip", "mainfile", "lastversion", "versions", "description", "homepage", "github", "author", "assets"]
    , params = _.pick(query, queryFields);
  return params;
}

router.param("cdn", function (req, res, next) {

  var cdn = req.params.cdn
    , collection = dbs[cdn];

  if (collection) {
    req.collection = collection;
    next();
  }
  else {
    res.status(400).json({status: 400, error: "Invalid library requested: " + cdn});
  }
});

router.get("/:cdn/libraries", function (req, res) {

  api.processRequest(req.collection, req.query, api.actions.find, _buildActionParams(req.query), function (err, result) {
    _sendResult(err, result, res);
  });
});

router.get("/:cdn/libraries/:name", function (req, res) {

  req.query.name = req.params.name;

  api.processRequest(req.collection, req.query, api.actions.findOne, _buildActionParams(req.query), function (err, result) {
    _sendResult(err, result, res);
  });
});

router.get("/:cdn/libraries/:name/:version", function (req, res) {

  req.query.name = req.params.name;
  req.query.version = req.params.version;

  api.processRequest(req.collection, req.query, api.actions.findOne, _buildActionParams(req.query), function (err, result) {
    _sendResult(err, result, res);
  });
});

module.exports = router;
