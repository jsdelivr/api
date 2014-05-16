#!/usr/bin/env node
'use strict';

var serve = require('../serve');

serve(function(err) {
    if(err) {
        return console.error(err);
    }

    console.log('Closing server');

    process.exit();
});

