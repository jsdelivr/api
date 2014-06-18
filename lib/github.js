'use strict';
var GitHubApi = require('github');

var github = new GitHubApi({
    version: '3.0.0',
    protocol: 'https',
    timeout: 5000
});

function auth(token) {
    if(token) {
        github.authenticate({
            type: 'oauth',
            token: token
        });
    }
    else {
        console.warn('No GitHub auth token was provided!');
    }

    return github;
}
module.exports = auth;
