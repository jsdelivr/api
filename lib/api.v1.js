/**
 * Created by austin on 5/9/15.
 */

"use strict";

var _ = require("lodash")

  , dbs = require("../db");

module.exports.actions = {
  "find": "find"
  , "findOne": "findOne"
};

module.exports.processRequest = function (collection, query, action, actionParams, cb) {

  var models = [];
  switch (action) {
    case this.actions.find:
      models = _prep(collection.find(actionParams));
      break;
    case this.actions.findOne:
      models = _prep([collection.findOne(actionParams)]);
      break;
    default:
      return cb(new Error("Invalid action " + action + " request of api.v1"));
  }

  if (query.version) {
    try {
      models = _selectVersion(query.version, models);
    }
    catch (err) {
      return cb(err);
    }
  }
  if (query.fields) {
    models = _selectFields(query, models);
  }

  cb(null, models);
};

// clean up the residual data from our loki db and wrap in the expected array response format
function _prep(models) {
  
  return _.each(models, function (model) {
    delete model.$loki;
    delete model.meta;
  });
}

function _selectVersion(version, models) {

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
