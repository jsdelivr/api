module.exports = {
  port: 8001,
  //cdns: ['bootstrap', 'cdnjs', 'google', 'jsdelivr', 'jquery'],
  cdns: ['bootstrap-cdn', 'jsdelivr', 'cdnjs', 'google'],
  //cdns: ['bootstrap-cdn', 'jsdelivr', 'cdnjs'],
  //cdns: ['bootstrap','google'],
  db: 'db',
  cdnCollections: [
    {name: 'bootstrap-cdn', aliases: ['bootstrap']},
    {name: 'jsdelivr', aliases: ['jsdelivr']},
    {name: 'cdnjs', aliases: ['cdnjs']},
    {name: 'google', aliases: ['google']}
  ],
  etagsCollection: 'etagsCollection',
  //syncUrl: 'http://localhost:8000/data/',
  syncUrl: 'http://144.76.57.166:8000/data/',
  tasks: {
    sync: {minute: 5}
  },
  maxcdn: {
    alias: 'replace this',
    key: 'replace this',
    secret: 'replace this',
    zoneId: 0 // replace with some zone id
  },
  github: '', // replace with github token
  sql: {
    host: '', // replace with api sql api instance host
    user: 'jsdelivr-api',
    password: '',
    database: 'reporting'
  }
};
