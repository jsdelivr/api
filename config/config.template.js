module.exports = {
    port: 8000,
    cdns: ['bootstrap', 'cdnjs', 'google', 'jsdelivr', 'jquery'],
    mongo: {
        hostname: 'localhost',
        port: 27017,
        db: 'jsdelivr_api_sync',
        username: '',
        password: ''
    },
    tasks: {
        sync: {minute: 0}
    }
};
