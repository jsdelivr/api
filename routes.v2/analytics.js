/**
 * Created by austin on 7/20/15.
 */

"use strict";

import express from "express";

import utils from "./utils.js"
import apiAnalytics from "../lib/api.v2.analytics";

var router = express.Router();

router.get("/:library", function (req, res) {
  apiAnalytics.processRequest(req.params.library, req.query, apiAnalytics.actions.hits, function (err, rows) {
    utils.sendResult(err, rows, req, res);
  });
});

module.exports = router;
