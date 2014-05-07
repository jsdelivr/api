'use strict';

var mongoose = require('mongoose');
var sugar = require('mongoose-sugar');


module.exports = require('./templates/v1')(sugar.schema(mongoose), sugar.mixed());
