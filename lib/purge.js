import MaxCDN from 'maxcdn';
import Promise from 'bluebird';


export default function (config) {
	let maxcdn = new MaxCDN(config.alias, config.key, config.secret);

	return Promise.promisify(function (cb) {
		maxcdn.del('zones/pull.json/' + config.zoneId + '/cache', cb);
	});
};
