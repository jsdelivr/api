module.exports = {
    port: 8000,
    tasks: {
        bootstrap: {minute: 0},
        cdnjs: {minute: 10},
        google: {minute: 20},
        jsdelivr: {minute: 30},
        jquery: {minute: 40}
    },
    maxcdn: {
        alias: 'replace this',
        key: 'replace this',
        secret: 'replace this',
        zoneId: 0 // replace with some zone id
    },
    github: '' // replace with github token
};
