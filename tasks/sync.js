import fs from 'fs';
import path from 'path';

import _ from 'lodash';
import Promise from 'bluebird';

import config from '../config';
import log from '../lib/log';

const readFile = Promise.promisify(fs.readFile);
const syncDir = path.join(__dirname, '../data/');

export default function (db) {
	return Promise.mapSeries(config.cdns, (cdn) => {
		// note the error but don't exit out of the loop,
		// it's okay to serve stale content if something goes wrong during the sync
		return syncCdn(db, cdn).catch((error) => {
			log.warning(`Error syncing CDN ${cdn}`);
			log.warning(error);
		});
	});
}

function syncCdn (db, cdn) {
	// attempt to get etags collection for this cdn
	let etagsCollection = db[config.etagsCollection];
	let cdnCache = etagsCollection.findOne({ cdn });
	let etags = cdnCache ? _.indexBy(cdnCache.etags || [], 'path') : {};

	// get the remote cache file
	let cFileUrl = path.join(syncDir, `${cdn}.json`);
	log.info(`Starting to sync ${cdn} from source ${cFileUrl}`);

	return readFile(cFileUrl, 'utf8').then((data) => {
		log.info(`Files for sync of ${cdn} retrieved from source ${cFileUrl}`);

		return Promise.map(JSON.parse(data), (remoteEtag) => {
			if (!etags[remoteEtag.path] || etags[remoteEtag.path].etag !== remoteEtag.etag) {
				return syncLibrary(db, cdn, remoteEtag.path).then(() => {
					etags[remoteEtag.path] = remoteEtag;
				}).catch((error) => {
					log.warning('Error syncing library!');
					log.warning(error);
				});
			}
		}, { concurrency: 10 });
	}).then(() => {
		log.info(`Successfully synced libraries for ${cdn}`);
		updateCdnEtags(etagsCollection, cdn, etags);
	});
}

function syncLibrary (db, cdn, library) {
	// get the remote library file
	let libraryUrl = path.join(syncDir, path.join(cdn, library, 'library.json'));

	return readFile(libraryUrl, 'utf8').then((data) => {
		if (!data) {
			throw new Error(`Request to sync ${library} from ${cdn} failed - empty response`);
		}

		let version = cdn.substr(0, 2);
		let schema = db[`${version}Schema`];
		let schemaKeys = Object.keys(schema);
		let collection = db[cdn];

		// create the db item by selecting desired values from synced data and filling in absent data w/ defaults
		let item = _.pick(JSON.parse(data), schemaKeys);
		_.defaults(item, schema);

		// only insert if the item does not currently exist
		let name = item.name || null;

		if (name) {
			let _item = collection.findOne({ name });

			if (!_item) {
				collection.insert(item);
			} else {
				collection.update(_.extend(_item, item));
			}
		}
	});
}

function updateCdnEtags (etagsCollection, cdn, etags) {
	let cdnCache = etagsCollection.findOne({ cdn });
	let cdnEtags = { cdn };

	cdnEtags.etags = _.map(etags, etag => etag);

	if (!cdnCache) {
		etagsCollection.insert(cdnEtags);
	} else {
		cdnEtags.meta = cdnCache.meta;
		cdnEtags.$loki = cdnCache.$loki;
		etagsCollection.update(cdnEtags);
	}
}
