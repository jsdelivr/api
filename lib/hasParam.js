import _ from 'lodash';

const dbs = require('../db');
const queryFields = Object.keys(dbs._schema);

export function hasParam(req) {
  return _.any(queryFields, field => _.has(query));
}
