var async = require('async');
var request = require('request');
var sugar = require('object-sugar');

var Library = require('../schemas').Library;


module.exports = function(cb) {
    var url = 'http://api.jsdelivr.com/packagesmain.php';

    request.get({
        url: url,
        json: true
    }, function(err, res, data) {
        if(err) return cb(err);

        sugar.removeAll(Library, function(err) {
            if(err) {
                return cb(err);
            }

            async.each(data.package, sugar.create.bind(null, Library), cb);
        });
    })
};
