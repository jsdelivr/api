'use strict';

var async = require('async');
var sugar = require('object-sugar');

var scrape = require('../lib/scrape_bootstrap');
var sortVersions = require('../lib/sort_versions');
var Library = require('../schemas').bootstrapLibrary;


module.exports = function(cb) {
    console.log('Starting to update bootstrap data');

    scrape(function(err, files) {
        if(err) {
            console.error('Failed to update bootstrap data!', err);

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

                sugar.update(Library, d._id, library, cb);
            });
        }, function(err) {
            if(err) {
                console.error(err);

                return cb(err);
            }

            console.log('Updated bootstrap data');

            cb();
        });
    });
};
