'use strict';

var async = require('async');
var sugar = require('object-sugar');

var scrape = require('../lib/scrape_jquery');
var sortVersions = require('../lib/sort_versions');
var Library = require('../schemas').jqueryLibrary;


module.exports = function(cb) {
    console.log('Starting to update jquery data');

    scrape(function(err, files) {
        if(err) {
            console.error('Failed to update jquery data!', err);

            return cb(err);
        }

        async.each(files, function(library, cb) {
            sugar.getOrCreate(Library, {
                name: library.name
            }, function(err, d) {
                if(err) {
                    return cb(err);
                }

                library.versions = sortVersions(library.versions);
                library.lastversion = library.versions[0];

                sugar.update(Library, d._id, library, cb);
            });
        }, function(err) {
            if(err) {
                console.error(err);

                return cb(err);
            }

            console.log('Updated jquery data');

            cb();
        });
    });
};
