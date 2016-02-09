import parseEnv from 'parse-env';
import configTemplate from './config.template';
let config;

try {
	config = require('./config');
} catch (e) {}

export default parseEnv(process.env, configTemplate, config);
