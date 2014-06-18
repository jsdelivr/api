'use strict';
var MaxCDN = require('maxcdn');


module.exports = function(config) {
    var maxcdn = new MaxCDN(config.alias, config.key, config.secret);

    return function(cb) {
        maxcdn.del('zones/pull.json/' + config.zoneId + '/cache', cb);
    };
};
