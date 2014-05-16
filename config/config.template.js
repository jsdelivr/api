module.exports = {
    port: 8000,
    cdns: ['bootstrap', 'cdnjs', 'google', 'jsdelivr', 'jquery'],
    syncUrl: 'http://jsdelivrapi-sync.aws.af.cm/data/',
    tasks: {
        sync: {minute: 0}
    }
};
