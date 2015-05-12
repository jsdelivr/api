module.exports = {
  port: 8001,
  //cdns: ['bootstrap', 'cdnjs', 'google', 'jsdelivr', 'jquery'],
  cdns: ['bootstrap', 'cdnjs', 'google', 'jsdelivr'],
  //cdns: ['bootstrap','google'],
  db: 'db',
  //syncUrl: 'http://localhost:8000/data/',
  syncUrl: 'http://jsdelivrapi-sync.aws.af.cm/data/',
  tasks: {
    sync: {minute: 5}
  },
  maxcdn: {
    alias: 'replace this',
    key: 'replace this',
    secret: 'replace this',
    zoneId: 0 // replace with some zone id
  },
  github: '' // replace with github token
};
