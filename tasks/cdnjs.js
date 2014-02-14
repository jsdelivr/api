var async = require('async');
var request = require('request');
var sugar = require('object-sugar');
var prop = require('annofp').prop;

var Library = require('../schemas').cdnjsLibrary;


module.exports = function(cb) {
    var url = 'https://cdnjs.com/packages.json';

    console.log('Starting to update cdnjs data');

    request.get({
        url: url,
        json: true
    }, function(err, res, data) {
        if(err || !data || !data.packages) {
            console.error('Failed to update cdnjs data!', err, data);

            return cb(err);
        }

        console.log('Fetched cdnjs data');

        async.each(data.packages, function(library, cb) {
            sugar.getOrCreate(Library, {
                name: library.name
            }, function(err, d) {
                if(err) {
                    return cb(err);
                }

                sugar.update(Library, d._id, {
                    mainfile: library.filename,
                    lastversion: library.version,
                    description: library.description,
                    homepage: library.homepage,
                    author: library.author,
                    assets: library.assets,
                    versions: library.assets && library.assets.map(prop('version'))
                }, cb);
            });
        }, function(err) {
            if(err) {
                console.error(err);

                return cb(err);
            }

            console.log('Updated cdnjs data');

            cb();
        });
    });
};

