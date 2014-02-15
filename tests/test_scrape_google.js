#!/usr/bin/env node
'use strict';

var fs = require('fs');

var scrape = require('../lib/scrape_google');


test();

function test() {
    fs.readFile('./data/google.html', 'utf-8', function(err, d) {
        if(err) {
            return console.error(err);
        }

        var result = scrape(d);

        console.log(result);
    });
}
