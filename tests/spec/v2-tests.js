require('../setup');
var chai = require('chai');
var expect = chai.expect;

chai.use(require('chai-http'));

describe('/v2/jsdelivr/', function() {
  var address = 'http://localhost:8001/v2/jsdelivr';

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
      expect(body[0]).to.have.property('assets');

      done();
    }, console.error);
  });

  it('Resolving with minimatch', function(done) {
    chai.request(address)
    .get('/libraries')
    .query({name: 'jq*'})
    .then(function(req) {
      expect(req).to.have.status(200);

      req.body.forEach(function(lib) {
        expect(lib.name).to.have.string('jq');
      });

      done();
    }, console.error);
  });
})
