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

  var actionParams = _buildActionParams(query)
    , models = [];

  switch (action) {
    case this.actions.find:

      var op = query.op || this.ops.and;
      if (!_.has(this.ops, op)) {
        var error = new Error("Invalid operation type supplied: " + op);
        error.code = 400;
        return cb(error);
      }

      if (actionParams.length > 1 && op === this.ops.and) {
        // process 'and' operation

        var chain = collection.chain();
        _.each(actionParams, function (actionParam) {
          chain.find(actionParam);
        });
        models = chain.data();
      }
      else if (actionParams.length > 1 && op === this.ops.or) {
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
        models = _.flatten(_.map(actionParams, function (actionParam) {
          return _.filter(collection.find(actionParam), filter);
        }));
      }
      else {
        // singular parameter requested
        models = collection.find(actionParams[0] || {});
      }
      break;
    case this.actions.findOne:

      var model = collection.findOne(_.filter(actionParams, function (param) {
          return _.has(param, "name");
        })[0] || {});

      if (model !== null) {
        models = [model];
      }
      else {
        var error = new Error("Requested library not found.");
        error.code = 404;
        return cb(error);
      }

      // the api v1 specs only attempt to get project files for a version
      // when permorming a '.../libraries/<NAME>/<VERSION>' query
      if (query.version) {
        try {
          models = _selectVersionFiles(query.version, models);
        }
        catch (err) {
          return cb(err);
        }
      }

      break;
    default:
      return cb(new Error("Invalid action " + action + " request of api.v1"));
  }

  models = _selectFields(query.fields || Object.keys(dbs._schema).join(","), models);
  cb(null, models);
};

function _selectVersionFiles(version, models) {

  var versionFiles = null;
  _.each(models, function (model) {
    var versionAssets = _.find(model.assets, {version: version});
    if (versionAssets) {
      versionFiles = versionAssets.files;
    }
  });

  if (!versionFiles) {
    var error = new Error("Requested version not found.");
    error.code = 404;
    throw error;
  }

  return versionFiles;
}

// pick out only the specified fields to return
function _selectFields(fields, models) {

  return _.map(models, _.partial(_.pick, _, fields.split(",")));
}
