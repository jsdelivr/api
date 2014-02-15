var async = require('async');
var request = require('request');
var sugar = require('object-sugar');

var scrape = require('../lib/scrape_google');
var Library = require('../schemas').googleLibrary;


module.exports = function(cb) {
    var url = 'https://developers.google.com/speed/libraries/devguide';

    console.log('Starting to update google data');

    request.get({
        url: url,
    }, function(err, res, data) {
        if(err || !data) {
            console.error('Failed to update google data!', err, data);

            return cb(err);
        }

        console.log('Fetched google data');

        async.each(scrape(data), function(library, cb) {
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

            console.log('Updated google data');

            cb();
        });
    });
};

