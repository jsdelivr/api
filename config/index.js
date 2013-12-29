var parseEnv = require('parse-env');

var configTemplate = require('./config.template');
var config;

try {
    config = require('./config');
}
catch(e) {}

module.exports = parseEnv(process.env, configTemplate, config);
