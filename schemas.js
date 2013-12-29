var sugar = require('object-sugar');
var schema = sugar.schema();


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

