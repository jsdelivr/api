#!/usr/bin/env node
'use strict';

var serve = require('../serve');
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

chai.use(chaiHttp);

it('starting server', function(done) {
  this.timeout(60000);
  serve(function(err) {
    expect(arguments).to.have.length(0);
    expect(err).to.be.undefined;

    console.log('Server is running');

    done();
  });
});
