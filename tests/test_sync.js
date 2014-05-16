#!/usr/bin/env node
'use strict';

var assert = require('assert');

var sugar = require('object-sugar');

var cdn = 'jsdelivr';

var schemas = require('../schemas')({
    cdns: [cdn]
});
var sync = require('../tasks')({
    url: '',
    sugar: sugar,
    request: {
        get: function(url, o, cb) {
            cb(null, null, [
                {
                    name: 'library'
                }
            ]);
        }
    },
    cdns: [cdn],
    schemas: schemas.object
}).sync;


testSync();

function testSync() {
    sugar.connect('db', function(err) {
        if(err) {
            return console.error(err);
        }

        var schema = schemas.object[cdn + 'Library'];

        sugar.create(schema, {
            name: 'remove'
        }, function(err) {
            if(err) {
                return console.error(err);
            }

            sync(function(err) {
                if(err) {
                    return console.error(err);
                }

                sugar.getAll(schema, function(err, d) {
                    if(err) {
                        return console.error(err);
                    }

                    assert.equal(d.length, 1);
                    assert.equal(d[0].name, 'library');
                });
            });
        });
    });
}
