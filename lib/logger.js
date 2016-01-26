var Logger = require('le_node');
var config = require('../config');

var logger = new Logger({
	withStack: true,
	timestamp: true,
	console: true,
	token: config.logentriesToken
});

module.exports = logger;
