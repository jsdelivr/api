#!/usr/bin/env node
'use strict';

require('babel/register');
module.exports = require('./main');

if (require.main === module) {
  module.exports();
}
