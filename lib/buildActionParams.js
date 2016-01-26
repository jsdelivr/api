var _ = require('lodash');
var minimatch = require('minimatch');
var dbs = require('../db');

var queryFields = {
  v1: Object.keys(dbs._v1Schema),
  v2: Object.keys(dbs._v2Schema)
};

module.exports = function buildActionParams (version, query) {
  // old format
  if (version === 'v1') {
    return _.map(_.pick(query, queryFields[version]), function (val, key) {
      return { [key]: { '$regex': minimatch.makeRe(val, { nocase: true }) } };
    });
  }

  return _.mapValues(_.pick(query, queryFields[version]), function (val) {
    return { '$regex': minimatch.makeRe(val, { nocase: true }) };
  });
};
