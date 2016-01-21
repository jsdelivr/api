import _ from 'lodash';

const dbs = require('../db');
const queryFields = {
  v1: Object.keys(dbs._v1Schema),
  v2: Object.keys(dbs._v2Schema)
};

export function hasParam(version, req) {
  return _.any(queryFields[version], field => _.has(query));
}
