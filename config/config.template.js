module.exports = {
    port: 8000,
    tasks: {
        bootstrap: {minute: 1},
        cdnjs: {minute: 1},
        google: {minute: 1},
        jsdelivr: {minute: 1},
        jquery: {minute: 1}
    },
    maxcdn: {
        alias: 'replace this',
        key: 'replace this',
        secret: 'replace this',
        zoneId: 0 // replace with some zone id
    },
    github: '' // replace with github token
};
