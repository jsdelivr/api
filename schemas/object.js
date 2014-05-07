'use strict';

var sugar = require('object-sugar');


module.exports = require('./templates/v1')(sugar.schema(), sugar.mixed());
