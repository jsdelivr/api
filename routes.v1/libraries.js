/**
 * Created by austin on 5/5/15.
 */

"use strict";

var router = new require("express").Router()
  , dbs = require("../db");

router.param("cdn", function (req, res, next) {

  var cdn = req.params.cdn
    , collection = dbs[cdn];

  if (collection) {
    req.collection = collection;
    next();
  }
  else {
    res.status(400).json({status: 400, error: "invalid library requested: " + cdn});
  }
});

router.get("/:cdn/libraries", function (req, res) {
  res.status(200).send(req.collection.data);
});

router.get("/:cdn/libraries/:name", function (req, res) {
  res.status(200).send(req.collection.findOne({name: req.params.name}));
});

module.exports = router;
