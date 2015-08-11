/**
 * Created by austin on 7/20/15.
 */

'use strict';

import _ from 'lodash';

import APIError from './APIError';

var sqlClient = global.KNEX.sqlClient;

module.exports.actions = {
  'hits': 'hits'
};

module.exports.processRequest = function (library, query, action, cb) {
  switch (action) {
    case this.actions.hits:
      _getHits(library, query, cb);
      break;
    default:
      var error = new APIError(`Invalid action ${action} request of api.v2`, 501);
      return cb(error);
  }
};

function _getHits(library, query, cb) {
  var sql = sqlClient.select("date", "hits")
      .from("results")
      .where("project", library)
      .orderBy("date", "desc")
    , today = new Date();

  if (query.date_from) {
    sql.where("date", ">", query.date_from);
  }
  else {
    var lowerBound = new Date().setDate(today.getDate() - 30);
    sql.where("date", ">", new Date(lowerBound).toISOString());
  }

  if (query.date_to) {
    sql.where("date", "<", query.date_to);
  }

  sql.then(function (rows) {

    var result = {};
    _.each(rows, function (row) {
      result[new Date(row.date).toISOString().split("T")[0]] = row.hits;
    });

    cb(null, result);
  }).catch(cb);
}
