var request = require('request');
var rest = require('rest-sugar');
var sugar = require('object-sugar');

var schemas = require('./schemas');


module.exports = function(app) {
    var root = '/v1/';

    initApi(app, root, 'cdnjs', schemas.cdnjsLibrary);
    initApi(app, root, 'google', schemas.googleLibrary);
    initApi(app, root, 'jsdelivr', schemas.jsDelivrLibrary);

    app.get('/packages.php', function(req, res) {
        request.get({
            url: 'http://www.jsdelivr.com/packages.php',
            pool: {
                maxSockets: 100
            }
        }).pipe(res);
    });
};

function initApi(app, root, cdn, schema) {
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
