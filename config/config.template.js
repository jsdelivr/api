module.exports = {
    port: 8000,
    //cdns: ['bootstrap', 'cdnjs', 'google', 'jsdelivr', 'jquery'],
    cdns: ['bootstrap', 'cdnjs', 'google', 'jsdelivr'],
    syncUrl: 'http://jsdelivrapi-sync.aws.af.cm/data/',
    tasks: {
        sync: {minute: 2}
    },
    maxcdn: {
        alias: 'replace this',
        key: 'replace this',
        secret: 'replace this',
        zoneId: 0 // replace with some zone id
    },
    github: '' // replace with github token
};
