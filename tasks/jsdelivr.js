var async = require('async');
var request = require('request');
var sugar = require('mongoose-sugar');

var Library = require('../schemas').Library;


module.exports = function(cb) {
    var url = 'http://api.jsdelivr.com/packagesmain.php';

    request.get({
        url: url,
        json: true
    }, function(err, res, data) {
        if(err || !data || !data.package) {
            return cb(err);
        }

        async.each(data.package, function(library, cb) {
            sugar.getOrCreate(Library, {
                name: library.name
            }, function(err, d) {
                if(err) {
                    return cb(err);
                }

                sugar.update(Library, d._id, library, cb);
            });
        }, cb);
    })
};
