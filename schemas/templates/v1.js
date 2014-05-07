'use strict';


module.exports = function(schema, mixed) {
    var fields = {
        name: String,
        zip: String,
        mainfile: String,
        mainfile2: String, // jsdelivr specific
        lastversion: String,
        description: String,
        homepage: String,
        github: String,
        author: String,
        versions: [String],
        assets: mixed
    };

    return function(imports) {
        var ret = {};

        imports.cdns.forEach(function(cdn) {
            schema(ret, cdn + 'Library').fields(fields);
        });

        return ret;
    };
};
