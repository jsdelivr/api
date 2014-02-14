var sugar = require('object-sugar');

var schema = sugar.schema();


var fields = {
    name: String,
    zip: String,
    mainfile: String,
    lastversion: String,
    description: String,
    homepage: String,
    github: String,
    author: String,
    assets: sugar.mixed(),
    versions: [String]
};

schema(exports, 'cdnjsLibrary').fields(fields);
schema(exports, 'jsDelivrLibrary').fields(fields);
