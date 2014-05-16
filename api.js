'use strict';

var request = require('request');
var rest = require('rest-sugar');

var is = require('annois');

var getAll = require('./lib/get_all');


module.exports = function(sugar, cdns, schemas) {
    // XXX: monkeypatching getAll for extra functionality. it would be nicer to decorate it
    sugar.getAll = getAll;

    return function(app) {
        app.all('*', function(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With');

            next();
        });

        initV1(cdns, schemas, app);

        app.get('/packages.php', function(req, res) {
            request.get({
                url: 'http://www.jsdelivr.com/packages.php',
                pool: {
                    maxSockets: 100
                }
            }).pipe(res);
        });
    };

    function initV1(cdns, schemas, app) {
        var root = '/v1/';

        cdns.forEach(function(name) {
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

                res.json(is.object(library)? [library]: []);
            });
        });

        var api = rest(app, root + cdn, {
            libraries: schema
        }, sugar);

        api.pre(function() {
            api.use(rest.only('GET'));
        });
    }
};
