var rest = require('rest-sugar');
var sugar = require('object-sugar');

var schemas = require('./schemas');


module.exports = function(app) {
    var api = rest(app, '/api/v1', {
        libraries: schemas.Library
    }, sugar);

    api.pre(function() {
        api.use(rest.only('GET'));
    });
};
