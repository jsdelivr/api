var rest = require('rest-sugar');
var sugar = require('object-sugar');

var Library = require('./schemas').Library;


module.exports = function(app) {
    var root = '/api/v1';

    app.get(root + '/libraries/:name/:version', function(req, res) {
        var version = req.params.version;

        sugar.getOne(Library, {
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

    app.get(root + '/libraries/:name', function(req, res) {
        sugar.getOne(Library, {
            name: req.params.name
        }, function(err, library) {
            if(err) {
                return res.send(404);
            }

            res.json([library]);
        });
    });

    var api = rest(app, root, {
        libraries: Library
    }, sugar);

    api.pre(function() {
        api.use(rest.only('GET'));
    });

    var librariesRoute = app.routes.get.filter(function(v) {
        return v.path === '/api/v1/libraries';
    })[0];

    app.get('/packages.php', librariesRoute.callbacks[0]);
};
