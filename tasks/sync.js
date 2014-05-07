'use strict';


module.exports = function(imports) {
    return function(cb) {
        // TODO: should sync now
        console.log('should sync now');
        // imports.sugars, imports.schemas

        cb();
    };
};
