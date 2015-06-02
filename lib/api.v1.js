/**
 * Created by austin on 5/9/15.
 */

"use strict";

var _ = require("lodash")
  , minimatch = require("minimatch")

  , dbs = require("../db");

function _buildActionParams(query) {

  var queryFields = Object.keys(dbs._schema);
  return _.map(_.pick(query, queryFields), function (val, key) {
    var obj = {};
    obj[key] = {"$regex": minimatch.makeRe(val)};
    return obj;
  });
}

module.exports.actions = {
  "find": "find"
  , "findOne": "findOne"
};

module.exports.ops = {
  "and": "and",
  "or": "or"
};

module.exports.processRequest = function (collection, query, action, cb) {

  var actionParams = _buildActionParams(query);

  switch (action) {
    case this.actions.find:
      _find(collection, query, actionParams, this.ops, cb);
      break;
    case this.actions.findOne:
      _findOne(collection, query, actionParams, cb);
      break;
    default:
      var error = new Error("Invalid action " + action + " request of api.v1");
      error.code = 501;
      return cb(error);
  }
};

// process request for generic query against a cdn collection
function _find(collection, query, actionParams, ops, cb) {

  var op = query.op || ops.and;

  if (!_.has(ops, op)) {
    var error = new Error("Invalid operation type supplied: " + op);
    error.code = 400;
    return cb(error);
  }

  if (actionParams.length > 1 && op === ops.and) {
    // process 'and' operation

    var chain = collection.chain();
    _.each(actionParams, function (actionParam) {
      chain.find(actionParam);
    });
    return cb(null, _selectFields(query.fields || [], chain.data()));
  }
  else if (actionParams.length > 1 && op === ops.or) {
    // process 'or' operation

    var keys = {}
      , filter = function (model) {
        if (!_.has(keys, model.$loki)) {
          keys[model.$loki] = true;
          return true;
        }
        else {
          return false;
        }
      };

    return cb(null, _selectFields(query.fields || [], _.flatten(_.map(actionParams, function (actionParam) {
      return _.filter(collection.find(actionParam), filter);
    }))));
  }
  else if (actionParams.length === 1) {
    // singular parameter requested
    return cb(null, _selectFields(query.fields || [], collection.find(actionParams[0])));
  }
  else {
    // no params, send back the entire collection
    return cb(null, _selectFields(query.fields || [], collection.data));
  }
}

// process request for singular library or singular libraries version files
function _findOne(collection, query, actionParams, cb) {

  var model = collection.findOne(_.find(actionParams, 'name') || {});

  if (model === null) {
    // Resolve with an empty array
    return cb(null, []);
  }

  // the api v1 specs only attempt to get project files for a version
  // when permorming a '.../libraries/<NAME>/<VERSION>' query
  if (query.version) {
    var files = _selectVersionFiles(query.version, model);
    if (files) {
      return cb(null, files);
    }
    else {
      var error = new Error("Requested version not found.");
      error.code = 404;
      return cb(error);
    }
  }

  return cb(null, _selectFields(query.fields || [], model));
}

function _selectVersionFiles(version, model) {

  var versionFiles = null
    , versionAssets = _.find(model.assets, {version: version});
  if (versionAssets) {
    versionFiles = versionAssets.files;
  }

  return versionFiles;
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
