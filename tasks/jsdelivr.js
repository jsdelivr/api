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
            console.error('Failed to update data!', err, data);
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
        }, function(err) {
            if(err) {
                console.error(err);
            }

            console.log('Updated data');

            cb();
        });;
    })
};
