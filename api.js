var rest = require('rest-sugar');
var sugar = require('object-sugar');

var Library = require('./schemas').Library;


module.exports = function(app) {
    var root = '/api/v1';

    app.get(root + '/libraries/:name', function(req, res) {
        sugar.getOne(Library, {
            name: req.params.name
        }, function(err, library) {
            if(err) {
                return res.send(404);
            }

            res.json(library);
        });
    });

    var api = rest(app, root, {
        libraries: Library
    }, sugar);

    api.pre(function() {
        api.use(rest.only('GET'));
    });
};
