process.env.PORT = 8090;

var serve = require('../serve');
var chai = require('chai');

serve().then(function () {
	console.log('Server is running');

	require('./spec/v1-tests');

	run();
});
