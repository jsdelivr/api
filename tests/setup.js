process.env.PORT = 8090;

var serve = require('../serve');
var chai = require('chai');
var chaiHttp = require('chai-http');

chai.use(chaiHttp);

serve().then(function () {
	console.log('Server is running');

	require('./spec/v1-tests');
	require('./spec/v2-tests');

	run();
});
