module.exports = {
	port: 8089,
	cdns: [
		'v1/bootstrap',
		'v2/bootstrap',
		'v1/cdnjs',
		'v2/cdnjs',
		'v1/google',
		'v2/google',
		'v1/jsdelivr',
		'v2/jsdelivr',
		'v1/jquery',
		'v2/jquery',
	],
	db: 'db',
	cdnCollections: [
		{ name: 'v1/bootstrap', aliases: [ 'v1/bootstrap-cdn' ] },
		{ name: 'v1/cdnjs', aliases: [ 'v1/cdnjs' ] },
		{ name: 'v1/google', aliases: [ 'v1/google' ] },
		{ name: 'v1/jsdelivr', aliases: [ 'v1/jsdelivr' ] },
		{ name: 'v1/jquery', aliases: [ 'v1/jquery' ] },
		{ name: 'v2/bootstrap', aliases: [ 'v2/bootstrap-cdn' ] },
		{ name: 'v2/cdnjs', aliases: [ 'v2/cdnjs' ] },
		{ name: 'v2/google', aliases: [ 'v2/google' ] },
		{ name: 'v2/jsdelivr', aliases: [ 'v2/jsdelivr' ] },
		{ name: 'v2/jquery', aliases: [ 'v2/jquery' ] },
	],
	etagsCollection: 'etagsCollection',
	//syncUrl: 'http://localhost:8000/data/',
	syncUrl: 'http://46.4.74.152:8000/data/',
	tasks: {
		sync: {},
	},
	maxcdn: {
		alias: 'replace this',
		key: 'replace this',
		secret: 'replace this',
		zoneId: 0, // replace with some zone id
	},
	github: '', // replace with github token
	logentriesToken: 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', // replace with logentries token
	sql: {
		host: '', // replace with api sql api instance host
		user: 'jsdelivr-api',
		password: '',
		database: 'reporting',
	},
};
