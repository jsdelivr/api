require('../setup');
var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;

chai.use(require('chai-http'));

describe('/v2/jsdelivr/', function() {
  var address = 'http://localhost:8001/v2/jsdelivr';

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
        expect(body[0]).to.have.property('assets');

        expect(req.body).to.have.length.above(800);

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

        expect(req.body).to.have.length.above(5);

        done();
      }, console.error);
    });

    it('Resolving with fuzzyness', function(done) {
      chai.request(address)
      .get('/libraries')
      .query({name: 'jwuery'})
      .then(function(req) {
        expect(req).to.have.status(200);

        var result = _.find(req.body, {
          name: 'jquery'
        });
        expect(result).to.not.be.undefined;

        done();
      }, console.error);
    });

    it('Multiple criteria', function(done) {
      chai.request(address)
      .get('/libraries')
      .query({name: 'jquery', 'author': 'jQuery*'})
      .then(function(req) {
        expect(req).to.have.status(200);
        console.log(req.body.length);
        expect(req.body).to.have.length(1);
        done();
      }, console.error);
    });
  });

});
