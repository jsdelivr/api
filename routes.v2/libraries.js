/**
 * Created by austin on 5/20/15.
 */

"use strict";

var router = new require("express").Router()
  , _ = require("lodash")

  , dbs = require("../db")
  , api = require("../lib/api.v2");


router.get("/echo", function (req, res) {
  api.echo(req.query, function (err, data) {
    res.status(200).json(data);
  });
});

module.exports = router;
