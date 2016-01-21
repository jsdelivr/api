var _ = require('lodash');
var minimatch = require('minimatch');
var dbs = require('../db');

var queryFields = {
  v1: Object.keys(dbs._v1Schema),
  v2: Object.keys(dbs._v2Schema)
};

module.exports = function buildActionParams(version, query) {
  return _.map(_.pick(query, queryFields[version]), function (val, key) {
    return { [key]: {'$regex': minimatch.makeRe(val, {nocase: true}) } };
  });
};
