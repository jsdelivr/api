var _ = require("lodash");
var minimatch = require("minimatch");
var dbs = require("../db");

var queryFields = Object.keys(dbs._schema);

module.exports = function buildActionParams(query) {
  return _.mapValues(_.pick(query, queryFields), function (val, key) {
    return {"$regex": minimatch.makeRe(val, {nocase: true})};
  });
}