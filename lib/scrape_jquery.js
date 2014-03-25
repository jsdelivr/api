'use strict';

var fp = require('annofp');
var prop = fp.prop;
var values = fp.values;

var GitHubApi = require('github');

var github = new GitHubApi({
    version: '3.0.0',
    protocol: 'https',
    timeout: 5000
});


module.exports = function(cb) {
    getFiles(function(err, files) {
        if(err) {
            return cb(err);
        }

        cb(null, parse(files));
    });
};

function parse(files) {
    var ret = {};

    files.forEach(function(file) {
        var parts = file.split('/');
        var filename, name, version;

        if(parts.length > 1) {
            filename = parts.join('/');

            if(parts[0] === 'mobile' || parts[0] === 'ui') {
                name = 'jquery-' + parts[0];
                version = parts[1];
            }
            else {
                name = parseName(filename.split('/').slice(-1).join('/'));
                version = parseVersion(filename);
        }
        }
        else {
            filename = parts[0];
            name = parseName(filename);
            version = parseVersion(filename);
        }

        if(!name) {
            return;
        }

        if(!(name in ret)) {
            ret[name] = {
                name: name,
                versions: [],
                assets: {} // version -> assets
            };
        }

        var lib = ret[name];

        // version
        if(lib.versions.indexOf(version) === -1) {
            lib.versions.push(version);
        }

        // assets
        if(!(version in lib.assets)) {
            lib.assets[version] = [];
        }

        lib.assets[version].push(filename);
    });

    return values(ret).map(function(v) {
        v.lastversion = v.versions.slice(-1)[0];

        // convert assets to v1 format
        var assets = [];

        fp.each(function(version, files) {
            assets.push({
                version: version,
                files: files
            });
        }, v.assets);

        v.assets = assets;

        return v;
    });
}

function parseName(str) {
    if(str.indexOf('LICENSE') >= 0) {
        return;
    }

    var parts = str.split('-');

    if(parts.length) {
        return str.split('-')[0];
    }
}

function parseVersion(str) {
    return str.split('-').slice(1).join('-').split('.').
        slice(0, -1).join('.').
        replace(/\.min/, '').
        replace(/\.pack/, '');
}

function getFiles(cb) {
    github.repos.getContent({
        user: 'jquery',
        repo: 'codeorigin.jquery.com',
        path: ''
    }, function(err, res) {
        if(err) {
            return cb(err);
        }

        var sha = res.filter(function(v) {
            return v.name === 'cdn';
        })[0].sha;

        github.gitdata.getTree({
            user: 'jquery',
            repo: 'codeorigin.jquery.com',
            sha: sha,
            recursive: 1
        }, function(err, res) {
            if(err) {
                return cb(err);
            }

            if(!res.tree) {
                return cb(new Error('Missing tree'));
            }

            // mode, 100644 === blob that is file
            cb(null, res.tree.filter(is('mode', '100644')).map(prop('path')));
        });
    });
}

function is(prop, val) {
    return function(v) {
        return v[prop] === val;
    };
}
