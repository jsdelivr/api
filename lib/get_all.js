'use strict';

var minimatch = require('minimatch');
var is = require('annois');
var fp = require('annofp');
var zip = require('annozip');
var levenshtein = require('fast-levenshtein');

module.exports = function(model, query, cb) {
    if(!is.object(query) || fp.count(query) === 0) {
        return is.fn(cb)? cb(null, filterDeleted(model._data)): query(null, filterDeleted(model._data));
    }
    var fields = query.fields;
    var limit = query.limit;
    var offset = query.offset || 0;
    var op = query.op;

    delete query.fields;
    delete query.limit;
    delete query.offset;
    delete query.op;

    var zq = zip(query);
    var ret = model._data;

    if(!is.array(zq)) {
        return cb(null, []);
    }

    if(fp.count(query)) {
        if(op === 'or') {
            ret = ret.filter(function(o) {
                return zq.map(function(p) {
                    var a = is.string(o[p[0]])? o[p[0]].toLowerCase(): '';
                    var b = is.string(p[1])? p[1].toLowerCase(): '';

                    return minimatch(a, b, {
                        matchBase: true
                    });
                }).filter(fp.id).length > 0;
            });
        }
        else {
            ret = ret.filter(function(o) {
                return zq.map(function(p) {
                    var a = is.string(o[p[0]])? o[p[0]].toLowerCase(): '';
                    var b = is.string(p[1])? p[1].toLowerCase(): '';

                    return minimatch(a, b, {
                        matchBase: true
                    });
                }).filter(fp.id).length === zq.length;
            });
        }
    }

    if(fields) {
        fields = is.array(fields)? fields: [fields];

        ret = ret.map(function(o) {
           var r = {};

            fields.forEach(function(k) {
                r[k] = o[k];
            });

            return r;
        });
    }

    // sort results by Levenshtein distance from the requested name
    var name_i = zq.map(function(q) { return q[0]; }).indexOf('name');
    if (name_i !== -1 && is.string(zq[name_i][1])) {
        var name = zq[name_i][1].toLowerCase();

        ret = ret.sort(function(a, b) {
            a = a.name.toLowerCase();
            b = b.name.toLowerCase();
            return levenshtein.get(a, name) - levenshtein.get(b, name);
        });
    }

    if(limit) {
        ret = ret.slice(offset, offset + limit);
    }

    cb(null, filterDeleted(ret));
};

function filterDeleted(arr) {
    return arr.filter(function(item) {
        return !item.deleted;
    });
}
