module.exports = {
    port: 8000,
    cdns: ['bootstrap', 'cdnjs', 'google', 'jsdelivr', 'jquery'],
    syncUrl: 'http://jsdelivrapi-sync.aws.af.cm/data/',
    tasks: {
        sync: {minute: 0}
    },
    maxcdn: {
        alias: 'replace this',
        key: 'replace this',
        secret: 'replace this',
        zoneId: 0 // replace with some zone id
    },
    github: '' // replace with github token
};
