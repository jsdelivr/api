/**
 * Created by austin on 5/5/15.
 */

"use strict";

var _ = require("lodash")
  , loki = require('lokijs')

  , config = require('../config');

function _v1Schema() {
  return {
    name: "",
    mainfile: "",
    lastversion: "",
    description: "",
    homepage: "",
    github: "",
    author: "",
    versions: [],
    assets: {}
  }
}

var dbs = {
  _db: new loki(config.db),
  _schema: _v1Schema()
};

_.each(config.cdns, function(cdn) {
  dbs[cdn] = dbs._db.addCollection(cdn, { indices: ['name']});
});

module.exports = dbs;
