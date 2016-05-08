var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
var timeout = 30000;

chai.use(require('chai-http'));

describe('/v2/jsdelivr/', function() {
	var address = 'http://localhost:8090/v2/jsdelivr';

	this.timeout(timeout);

	describe('/libraries', function() {
		it('Resolving /libraries', function(done) {
			chai.request(address)
				.get('/libraries')
				.then(function(req) {
					expect(req).to.have.status(200);
					expect(req).to.be.json;

					var body = req.body;
					expect(body).to.be.instanceof(Array);
					expect(body[0]).to.have.property('name');
					expect(body[0]).to.have.property('mainfile');
					expect(body[0]).to.have.property('lastversion');
					expect(body[0]).to.have.property('description');
					expect(body[0]).to.have.property('homepage');
					expect(body[0]).to.have.property('github');
					expect(body[0]).to.have.property('author');
					expect(body[0]).to.have.property('versions');
					expect(body[0]).to.have.property('repositories');
					expect(body[0]).to.have.property('meta');
					expect(body[0]).to.not.have.property('assets');

					expect(req.body).to.have.length.above(800);

					done();
				})
				.catch(done);
		});

		it('Fuzzy search', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ name: 'jquery' })
				.then(function (req) {
					expect(req).to.have.status(200);

					expect(req.body[0].name).to.equal('jquery');
					expect(req.body).to.have.length.above(1);

					done();
				})
				.catch(done);
		});

		it('Fuzzy search #2', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ name: 'jwuery' })
				.then(function (req) {
					expect(req).to.have.status(200);

					var result = _.find(req.body, {
						name: 'jquery'
					});
					expect(result).to.not.be.undefined;

					done();
				})
				.catch(done);
		});

		it('Minimatch search', function(done) {
			chai.request(address)
				.get('/libraries')
				.query({ name: 'jquery*' })
				.then(function(req) {
					expect(req).to.have.status(200);

					req.body.forEach(function(lib) {
						expect(lib.name).to.have.string('jquery');
					});

					expect(req.body).to.have.length.above(5);

					done();
				})
				.catch(done);
		});

		it('/libraries/<library> alias', function (done) {
			chai.request(address)
				.get('/libraries/jquery')
				.then(function (req) {
					expect(req).to.have.status(200);

					expect(req.body[0].name).to.equal('jquery');
					expect(req.body).to.have.length.above(1);

					done();
				})
			   .catch(done);
		});

		it('Multiple libraries', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ name: 'jquery,bootstrap' })
				.then(function (req) {
					expect(req).to.have.status(200);

					var result = _.find(req.body, {
						name: 'jquery'
					});
					expect(result).to.not.be.undefined;

					result = _.find(req.body, {
						name: 'bootstrap'
					});
					expect(result).to.not.be.undefined;

					expect(req.body).to.have.length(2);

					done();
				})
				.catch(done);
		});

		it('Multiple libraries with minimatch', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ name: 'jquery,bootstrap*' })
				.then(function (req) {
					expect(req).to.have.status(200);

					req.body.forEach(function(lib) {
						expect(lib.name).to.match(/^(?:jquery|bootstrap.*)$/i);
					});

					expect(req.body).to.have.length.above(2);

					done();
				})
				.catch(done);
		});

		it('Search by mainfile', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ mainfile: 'jquery.min.js' })
				.then(function (req) {
					expect(req).to.have.status(200);

					req.body.forEach(function(lib) {
						expect(lib.mainfile).to.equal('jquery.min.js');
					});

					expect(req.body).to.have.length.above(0);

					done();
				})
				.catch(done);
		});

		it('Search by last version', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ lastversion: '2.0.3' })
				.then(function (req) {
					expect(req).to.have.status(200);
					expect(req.body).to.have.length.above(0);

					done();
				})
				.catch(done);
		});

		it('Search by author', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ author: 'jQuery Foundation' })
				.then(function (req) {
					expect(req).to.have.status(200);

					req.body.forEach(function(lib) {
						expect(lib.author).to.equal('jQuery Foundation');
					});

					expect(req.body).to.have.length.above(0);

					done();
				})
				.catch(done);
		});

		it('Search by homepage', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ homepage: 'http://jquery.com/' })
				.then(function (req) {
					expect(req).to.have.status(200);

					req.body.forEach(function(lib) {
						expect(lib.homepage).to.equal('http://jquery.com/');
					});

					expect(req.body).to.have.length(1);

					done();
				})
				.catch(done);
		});

		it('Search by GitHub', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ github: 'https://github.com/jquery/jquery' })
				.then(function (req) {
					expect(req).to.have.status(200);

					req.body.forEach(function(lib) {
						expect(lib.github).to.equal('https://github.com/jquery/jquery');
					});

					expect(req.body).to.have.length(1);

					done();
				})
				.catch(done);
		});

		it('Select specific fields', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ fields: 'name,mainfile' })
				.then(function (req) {
					expect(req).to.have.status(200);

					var body = req.body;
					expect(body[0]).to.have.property('name');
					expect(body[0]).to.have.property('mainfile');
					expect(body[0]).to.not.have.property('lastversion');
					expect(body[0]).to.not.have.property('description');
					expect(body[0]).to.not.have.property('homepage');
					expect(body[0]).to.not.have.property('github');
					expect(body[0]).to.not.have.property('author');
					expect(body[0]).to.not.have.property('versions');
					expect(body[0]).to.not.have.property('repositories');
					expect(body[0]).to.not.have.property('meta');
					expect(body[0]).to.not.have.property('assets');

					done();
				})
				.catch(done);
		});

		it('Multiple criteria', function (done) {
			chai.request(address)
				.get('/libraries')
				.query({ name: 'jquery*', author: 'jQuery', mainfile: 'jquery-migrate.min.js' })
				.then(function (req) {
					expect(req).to.have.status(200);

					req.body.forEach(function(lib) {
						expect(lib.name).to.have.string('jquery');
						expect(lib.author).to.equal('jQuery');
						expect(lib.mainfile).to.equal('jquery-migrate.min.js');
					});

					expect(req.body).to.have.length.above(0);

					done();
				})
				.catch(done);
		});

		it('/library', function (done) {
			chai.request(address)
				.get('/library')
				.query({ name: 'jquery' })
				.then(function (req) {
					expect(req).to.have.status(200);

					expect(req.body.name).to.equal('jquery');
					expect(req.body.assets).to.be.instanceof(Object);

					done();
				})
				.catch(done);
		});

		it('/library<library> alias', function (done) {
			chai.request(address)
				.get('/library/jquery')
				.then(function (req) {
					expect(req).to.have.status(200);

					expect(req.body.name).to.equal('jquery');
					expect(req.body.assets).to.be.instanceof(Object);

					done();
				})
				.catch(done);
		});

		it('/library/<library>/version', function (done) {
			chai.request(address)
				.get('/library/jquery/2.2.0')
				.then(function (req) {
					expect(req).to.have.status(200);

					expect(req.body.baseUrl).to.be.a('string');
					expect(req.body.mainfile).to.be.a('string');
					expect(req.body.files).to.be.instanceof(Array);
					expect(req.body.files).to.have.length(3);
					expect(req.body.files).to.include('jquery.js');
					expect(req.body.files).to.include('jquery.min.js');
					expect(req.body.files).to.include('jquery.min.map');

					done();
				})
			   .catch(done);
		});
	});
});

describe('/v2/cdnjs/', function() {
	var address = 'http://localhost:8090/v2/cdnjs';

	this.timeout(timeout);

	describe('/libraries', function() {
		it('Resolving /libraries', function(done) {
			chai.request(address)
				.get('/libraries')
				.query({ name: 'jquery*' }) // returning all libraries takes too long
				.then(function(req) {
					expect(req).to.have.status(200);
					expect(req).to.be.json;

					var body = req.body;
					expect(body).to.be.instanceof(Array);
					expect(body[0]).to.have.property('name');
					expect(body[0]).to.have.property('mainfile');
					expect(body[0]).to.have.property('lastversion');
					expect(body[0]).to.have.property('description');
					expect(body[0]).to.have.property('homepage');
					expect(body[0]).to.have.property('github');
					expect(body[0]).to.have.property('author');
					expect(body[0]).to.have.property('versions');
					expect(body[0]).to.have.property('repositories');
					expect(body[0]).to.have.property('meta');
					expect(body[0]).to.not.have.property('assets');

					expect(req.body).to.have.length.above(10);

					done();
				})
				.catch(done);
		});
	});
});

describe('/v2/google/', function() {
	var address = 'http://localhost:8090/v2/google';

	this.timeout(timeout);

	describe('/libraries', function() {
		it('Resolving /libraries', function(done) {
			chai.request(address)
				.get('/libraries')
				.then(function(req) {
					expect(req).to.have.status(200);
					expect(req).to.be.json;

					var body = req.body;
					expect(body).to.be.instanceof(Array);
					expect(body[0]).to.have.property('name');
					expect(body[0]).to.have.property('mainfile');
					expect(body[0]).to.have.property('lastversion');
					expect(body[0]).to.have.property('description');
					expect(body[0]).to.have.property('homepage');
					expect(body[0]).to.have.property('github');
					expect(body[0]).to.have.property('author');
					expect(body[0]).to.have.property('versions');
					expect(body[0]).to.have.property('repositories');
					expect(body[0]).to.have.property('meta');
					expect(body[0]).to.not.have.property('assets');

					expect(req.body).to.have.length.above(10);

					done();
				})
				.catch(done);
		});
	});
});

describe('/v2/bootstrap/', function() {
	var address = 'http://localhost:8090/v2/bootstrap';

	this.timeout(timeout);

	describe('/libraries', function() {
		it('Resolving /libraries', function(done) {
			chai.request(address)
				.get('/libraries')
				.then(function(req) {
					expect(req).to.have.status(200);
					expect(req).to.be.json;

					var body = req.body;
					expect(body).to.be.instanceof(Array);
					expect(body[0]).to.have.property('name');
					expect(body[0]).to.have.property('mainfile');
					expect(body[0]).to.have.property('lastversion');
					expect(body[0]).to.have.property('description');
					expect(body[0]).to.have.property('homepage');
					expect(body[0]).to.have.property('github');
					expect(body[0]).to.have.property('author');
					expect(body[0]).to.have.property('versions');
					expect(body[0]).to.have.property('repositories');
					expect(body[0]).to.have.property('meta');
					expect(body[0]).to.not.have.property('assets');

					expect(req.body).to.have.length.above(5);

					done();
				})
				.catch(done);
		});
	});
});

describe('/v2/jquery/', function() {
	var address = 'http://localhost:8090/v2/jquery';

	this.timeout(timeout);

	describe('/libraries', function() {
		it('Resolving /libraries', function(done) {
			chai.request(address)
				.get('/libraries')
				.then(function(req) {
					expect(req).to.have.status(200);
					expect(req).to.be.json;

					var body = req.body;
					expect(body).to.be.instanceof(Array);
					expect(body[0]).to.have.property('name');
					expect(body[0]).to.have.property('mainfile');
					expect(body[0]).to.have.property('lastversion');
					expect(body[0]).to.have.property('description');
					expect(body[0]).to.have.property('homepage');
					expect(body[0]).to.have.property('github');
					expect(body[0]).to.have.property('author');
					expect(body[0]).to.have.property('versions');
					expect(body[0]).to.have.property('repositories');
					expect(body[0]).to.have.property('meta');
					expect(body[0]).to.not.have.property('assets');

					expect(req.body).to.have.length.above(5);

					done();
				})
				.catch(done);
		});
	});
});
