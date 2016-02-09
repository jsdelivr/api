import _ from 'lodash';
import Loki from 'lokijs';
import config from '../config';

let db = {
	db: new Loki(config.db),
	v1Schema: {
		name: '',
		mainfile: '',
		lastversion: '',
		description: '',
		homepage: '',
		github: '',
		author: '',
		versions: [],
		assets: {},
		meta: {},
	},
	v2Schema: {
		name: '',
		mainfile: '',
		lastversion: '',
		description: '',
		homepage: '',
		github: '',
		author: '',
		versions: [],
		assets: {},
		repositories: [],
		meta: {},
	},
	etagsSchema: {
		cdn: '',
	},
};

// add a collection for each cdn
_.each(config.cdnCollections, (collection) => {
	db[collection.name] = db.db.addCollection(collection.name, { indices: [ 'name' ] });
});

// add an etags collection
db[config.etagsCollection] = db.db.addCollection(config.etagsCollection, { indices: [ 'cdn' ] });

export default db;
