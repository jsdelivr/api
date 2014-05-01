'use strict';

var cheerio = require('cheerio');

module.exports = function(data) {
    var $ = cheerio.load(data);
    var libs = $('div[itemprop="articleBody"] div');
    var ret = [];

    libs.each(function(i, e) {
        var $e = $(e);
        var dd = $e.find('dd');
        var versions = getVersions($(dd[2])).concat(getVersions($(dd[3]))).sort();

        ret.push({
            name: $e.find('dt').text(),
            mainfile: $e.find('code').text().split('"').slice(-2, -1)[0].split('/').slice(-1)[0],
            homepage: $(dd[1]).find('a').attr('href'),
            lastversion: versions.slice(-1)[0],
            versions: versions
        });
    });

    return ret;
};

function getVersions($e) {
    return $e.find('.versions').text().split(',').filter(id).map(trim);
}

function trim(s) {
    return s.trim();
}

function id(a) {
    return a;
}
