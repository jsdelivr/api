/**
 * Created by austin on 5/9/15.
 */

"use strict";

var _ = require("lodash")
  , minimatch = require("minimatch");

function _buildActionParams(query) {

  var queryFields = ["name", "zip", "mainfile", "lastversion", "versions", "description", "homepage", "github", "author", "assets"];
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

module.exports.processRequest = function (collection, query, action, cb) {

  var actionParams = _buildActionParams(query)
    , models = [];

  switch (action) {
    case this.actions.find:

      if (actionParams.length > 1) {
        var chain = collection.chain();
        _.each(actionParams, function (actionParam) {
          chain.find(actionParam);
        });
        models = _prep(chain.data());
      }
      else {
        models = _prep(collection.find(actionParams[0] || {}));
      }
      break;
    case this.actions.findOne:

      var model = collection.findOne(_.filter(actionParams, function (param) {
          return _.has(param, "name");
        })[0] || {});

      if (model !== null) {
        models = _prep([model]);
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

  if (query.fields) {
    models = _selectFields(query, models);
  }

  cb(null, models);
};

// clean up the residual data from our loki db and wrap in the expected array response format
function _prep(models) {

  return _.each(models || [], function (model) {
    delete model.$loki;
    delete model.meta;
  });
}

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
function _selectFields(query, models) {

  return _.map(models, _.partial(_.pick, _, query.fields.split(",")));
}
