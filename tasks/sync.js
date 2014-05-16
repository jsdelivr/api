'use strict';

var url = require('url');

var async = require('async');
var prop = require('annofp').prop;


module.exports = function(imports) {
    var sugar = imports.sugar;
    var request = imports.request;

    return function(cb) {
        async.each(imports.cdns, function(cdn, cb) {
            console.log('Starting to sync', cdn);

            request.get(url.resolve(imports.url, cdn + '.json'), {
                json: true
            }, function(err, res, libraries) {
                if(err) {
                    return cb(err);
                }

                var schema = imports.schemas[cdn + 'Library'];

                async.each(libraries, function(library, cb) {
                    sugar.getOrCreate(schema, {
                        name: library.name
                    }, function(err, d) {
                        if(err) {
                            return cb(err);
                        }

                        sugar.update(schema, d._id, library, cb);
                    });
                }, function(err) {
                    if(err) {
                        return cb(err);
                    }

                    removeExtras(schema, libraries.map(prop('name')), function(err) {
                        if(err) {
                            return cb(err);
                        }

                        console.log('Synced', cdn);

                        cb();
                    });
                });
            });
        }, cb);
    };

    function removeExtras(schema, retained, cb) {
        sugar.getAll(schema, function(err, libraries) {
            if(err) {
                return cb(err);
            }

            async.each(libraries, function(library, cb) {
                if(retained.indexOf(library.name) === -1) {
                    return sugar.remove(schema, library._id, cb);
                }

                cb();
            }, cb);
        });
    }
};
