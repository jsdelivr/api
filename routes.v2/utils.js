/**
 * Created by austin on 7/20/15.
 */

"use strict";

module.exports.sendResult = function (err, result, req, res) {

  if (err) {
    var error = {
      status: err.code || 500,
      message: err.message || err,
      url: req.url
    };
    res.status(error.status).jsonp(error);
  }
  else {
    // attach any header values contained in the result
    if (result._headers) {
      res.set(result._headers);
      delete  result._headers;
    }

    res.status(200).jsonp(result);
  }
};
