'use strict';

var parseEnv = require('parse-env');

var configTemplate = require('./config.template');
var config;

try {
    config = require('./config');
}
catch(e) {}

var env = parseEnv(process.env, configTemplate, config);

if(process.env.VCAP_SERVICES){
    var vcap = JSON.parse(process.env.VCAP_SERVICES);

    env.mongo = vcap['mongodb2-2.4.8'][0]['credentials'];
}

module.exports = env;
