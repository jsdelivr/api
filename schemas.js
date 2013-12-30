var mongoose = require('mongoose');
var sugar = require('mongoose-sugar');
var schema = sugar.schema(mongoose);


schema(exports, 'Library').fields({
    name: String,
    zip: String,
    mainfile: String,
    lastversion: String,
    description: String,
    homepage: String,
    github: String,
    author: String,
    assets: [Object],
    versions: [String]
});

