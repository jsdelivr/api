#!/usr/bin/env node
var jsdelivr = require('../tasks').jsdelivr;


main();

function main() {
    jsdelivr(function(err) {
        if(err) {
            return console.error(err);
        }
    });
}

