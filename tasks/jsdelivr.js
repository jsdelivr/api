var async = require('async');
var request = require('request');
var sugar = require('object-sugar');

var Library = require('../schemas').jsDelivrLibrary;


module.exports = function(cb) {
    var url = 'http://www.jsdelivr.com/packagesmain.php';

    console.log('Starting to update data');

    request.get({
        url: url,
        json: true
    }, function(err, res, data) {
        if(err || !data || !data.package) {
            console.error('Failed to update data!', err, data);

            return cb(err);
        }

        console.log('Fetched data');

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

                return cb(err);
            }

            console.log('Updated data');

            cb();
        });
    });
};

