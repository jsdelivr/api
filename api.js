'use strict';

var request = require('request');
var rest = require('rest-sugar');
var sugar = require('object-sugar');

var schemas = require('./schemas');
var getAll = require('./lib/get_all');

sugar.getAll = getAll;


module.exports = function(app) {
    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');

        next();
    });

    initV1(app);

    app.get('/packages.php', function(req, res) {
        request.get({
            url: 'http://www.jsdelivr.com/packages.php',
            pool: {
                maxSockets: 100
            }
        }).pipe(res);
    });
};

function initV1(app) {
    var root = '/v1/';

    ['bootstrap', 'cdnjs', 'google', 'jsdelivr'].forEach(function(name) {
        initV1Api(app, root, name, schemas[name + 'Library']);
    });
}

function initV1Api(app, root, cdn, schema) {
    app.get(root + cdn + '/libraries/:name/:version', function(req, res) {
        var version = req.params.version;

        sugar.getOne(schema, {
            name: req.params.name
        }, function(err, library) {
            if(err) {
                return res.send(404);
            }

            var d = library.assets.filter(function(asset) {
                return asset.version === version;
            })[0];

            if(d && d.files) {
                return res.json(d.files);
            }

            return res.send(404);
        });
    });

    app.get(root + cdn + '/libraries/:name', function(req, res) {
        sugar.getOne(schema, {
            fields: req.query.fields && req.query.fields.split(','),
            name: req.params.name
        }, function(err, library) {
            if(err) {
                return res.send(404);
            }

            res.json([library]);
        });
    });

    var api = rest(app, root + cdn, {
        libraries: schema
    }, sugar);

    api.pre(function() {
        api.use(rest.only('GET'));
    });
}
