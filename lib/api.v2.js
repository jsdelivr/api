/**
 * Created by austin on 5/20/15.
 */

"use strict";

var _ = require("lodash")
  , minimatch = require("minimatch")

  , dbs = require("../db");

var levenshtein = require('underscore.string/levenshtein');

var APIError = require("./APIError");
var buildActionParams = require('./buildActionParams');
var scoreNameMatch = require('./scoreNameMatch');

module.exports.actions = {
  "find": "find"
  , "findOne": "findOne"
};

module.exports.processRequest = function (collection, query, action, cb) {

  var actionParams = buildActionParams(query);

  switch (action) {
    case this.actions.find:
      _find(collection, query, actionParams, cb);
      break;
    case this.actions.findOne:
      _findOne(collection, query, actionParams, cb);
      break;
    default:
      var error = new APIError(`Invalid action ${action} request of api.v1`, 501);
      return cb(error);
  }
};

// process request for generic query against a cdn collection
function _find(collection, query, actionParams, cb) {

  if (actionParams.length > 1) {
    var chain = collection.chain();
    _.each(actionParams, function (actionParam) {
      chain.find(actionParam);
    });
    return cb(null, _formatResponse(query, chain.data()));
  }
  else {
    // no params, send back the entire collection
    return cb(null, _formatResponse(query, collection.data));
  }
}

// process request for singular library or singular libraries version files
function _findOne(collection, query, actionParams, cb) {

  var params = _.partition(actionParams, 'name'),
    nameCriteria = params[0], otherCritieria = params[1],
    libs = collection.find(otherCritieria);

  var model, score = Infinity;
  // Custom handling of ?name param
  for (var i = 0; i < libs.length; i++) {
    var _score = scoreNameMatch(libs[i], nameCriteria);
    if (_score === -1) continue;
    if (_score < score) {
      model = libs[i];
      score = _score;
    }
    // Break on exact match
    if (score === 0) break;
  }

  if (model === null) {
    // Resolve with an empty array
    var error = new Error("Requested project not found.");
    error.code = 404;
    return cb(error);
  }

  // the api v1 specs only attempt to get project files for a version
  // when permorming a '.../libraries/<NAME>/<VERSION>' query
  if (query.version) {
    var files = _selectVersionFiles(query.version, model);
    if (files) {
      return cb(null, files);
    }
    var error = new APIError("Requested version not found.", 404);
    return cb(error);
  }

  //return cb(null, _selectFields(query.fields || [], model));
  return cb(null, _formatResponse(query, model));
}

function _selectVersionFiles(version, model) {
  var versionAssets = _.find(model.assets, {version: version});
  return _.result(versionAssets, 'files');
}

// pick out only the specified fields to return
function _selectFields(fields, models) {

  if (fields.length) {
    if (_.isArray(models)) {
      return _.map(models, _.partial(_.pick, _, fields.split(",")));
    }
    else {
      return _.pick(models, fields.split(","));
    }
  }
  else {
    return models;
  }
}

// structure the response according to v2 schema and pass through to _selectFields
function _formatResponse(query, models) {

  var _formatAssets = function formatAssets(model) {
    return _.map(model.assets, function (asset) {
      var obj = {};
      obj[asset.version] = asset;
      delete asset.version;
      return obj;
    });
  };

  var response = _.clone(models);
  if (_.isArray(models)) {
    response = _.map(response, function (model) {
      if (model.assets) {
        model.assets = _formatAssets(model);
      }
      return model;
    });
  }
  else {
    response.assets = _formatAssets(models);
  }

  return _selectFields(query.fields || [], response);
}
