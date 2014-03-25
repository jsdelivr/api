#!/usr/bin/env node
'use strict';

var scrape = require('../lib/scrape_jquery');


test();

function test() {
    scrape(function(err, d) {
        if(err) {
            return console.error(err);
        }

        console.log(JSON.stringify(d, null, 4));
    });
}
