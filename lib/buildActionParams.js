var _ = require("lodash");
var minimatch = require("minimatch");
var dbs = require("../db");

module.exports = function buildActionParams(query) {
  var queryFields = Object.keys(dbs._schema);
  return _.map(_.pick(query, queryFields), function (val, key) {
    var obj = {};
    obj[key] = {"$regex": minimatch.makeRe(val), $val: val};
    return obj;
  });
}