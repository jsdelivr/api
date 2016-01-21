/**
 * Created by austin on 5/5/15.
 */

'use strict';

var _ = require('lodash')
  , loki = require('lokijs')

  , config = require('../config');

function _schema() {
  return {
    name: '',
    mainfile: '',
    lastversion: '',
    description: '',
    homepage: '',
    github: '',
    author: '',
    versions: [],
    assets: {},
    repositories: []
  };
}

function _v1Schema() {
  return {
    name: '',
    mainfile: '',
    lastversion: '',
    description: '',
    homepage: '',
    github: '',
    author: '',
    versions: [],
    assets: {}
  };
}

function _v2Schema() {
  return {
    name: '',
    mainfile: '',
    lastversion: '',
    description: '',
    homepage: '',
    github: '',
    author: '',
    versions: [],
    assets: {},
    repositories: []
  };
}

function _etagsSchema() {
  return {
    cdn: ""
  }
}

var dbs = {
  _db: new loki(config.db),
  _schema: _schema(),
  _v1Schema: _v1Schema(),
  _v2Schema: _v2Schema(),
  _etagsSchema: _etagsSchema()
};

// add a collection for each cdn
_.each(config.cdnCollections, function (collection) {
  dbs[collection.name] = dbs._db.addCollection(collection.name, {indices: ['name']});
});

// add an etags collection
dbs[config.etagsCollection] = dbs._db.addCollection(config.etagsCollection, {indices: ['cdn']});

module.exports = dbs;
