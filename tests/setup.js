#!/usr/bin/env node
'use strict';

var serve = require('../serve');
var chai = require('chai');
var chaiHttp = require('chai-http');

chai.use(chaiHttp);



serve(function(err) {
  console.log('Server is running');

  require('./spec/v2-tests');

  run();
});
