/**
 * Created by austin on 5/20/15.
 */

"use strict";

var _ = require("lodash")
  , minimatch = require("minimatch")

  , dbs = require("../db");

module.exports.echo = function (data, cb) {
  cb(null, data);
};
