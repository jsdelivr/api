import _ from 'lodash';
import minimatch from 'minimatch';

import ApiError from '../lib/ApiError';
import db from '../db';

let ops = { and: 'and', or: 'or' };
let v1Keys = Object.keys(db.v1Schema);

// search for multiple libraries
export function find (collection, query, cb) {
	let actionParams = buildActionParams(query);
	let op = query.op || ops.and;

	let _cb = (err, results) => {
		if (!err) {
			let limit = Number(query.limit);

			if (_.isFinite(limit)) {
				results = _.take(results, limit);
			}
		}

		cb(err, results);
	};

	if (!_.has(ops, op)) {
		return _cb(new ApiError(`Invalid operation type supplied: ${op}`, 400));
	}

	// and
	if (actionParams.length > 1 && op === ops.and) {
		let chain = collection.chain();

		_.each(actionParams, (actionParam) => {
			chain.find(actionParam);
		});

		return _cb(null, selectFields(query.fields, chain.data()));
	}

	// or
	else if (actionParams.length > 1 && op === ops.or) {
		let keys = {};
		let filter = (model) => {
			if (!_.has(keys, model.$loki)) {
				keys[model.$loki] = true;
				return true;
			} else {
				return false;
			}
		};

		return _cb(null, selectFields(query.fields, _.flatten(_.map(actionParams, (actionParam) => {
			return _.filter(collection.find(actionParam), filter);
		}))));
	}

	// one parameter
	else if (actionParams.length === 1) {
		return _cb(null, selectFields(query.fields, collection.find(actionParams[0])));
	}

	// no parameters
	else {
		return _cb(null, selectFields(query.fields, collection.data));
	}
}

// search for one library
export function findOne (collection, query, cb) {
	let actionParams = buildActionParams(query);
	let model = collection.findOne(_.find(actionParams, 'name') || {});

	if (model === null) {
		// Resolve with an empty array
		return cb(null, []);
	}

	if (query.version) {
		let files = selectVersionFiles(query.version, model);

		if (files) {
			return cb(null, files);
		} else {
			return cb(new ApiError('Requested version not found.', 404));
		}
	}

	return cb(null, selectFields(query.fields, model));
}

export function respond (err, result, req, res) {
	if (err) {
		let error = {
			status: err.code || 500,
			message: err.message || err,
			url: req.url,
		};

		res.status(error.status).json(error);
	} else {
		// all v1 responses are expected to be in the form of an array,
		// even in the case of a <cdn>/libraries/<libraryName> request (which only ever returns a singular object)
		res.status(200).json(_.isArray(result) ? result : [ result ]);
	}
}

function buildActionParams (query) {
	return _.map(_.pick(query, v1Keys), (val, key) => {
		return { [key]: { '$regex': minimatch.makeRe(val, { nocase: true }) } };
	});
}

function selectFields (fields, models) {
	if (typeof fields !== 'string' || !fields) {
		return models;
	}

	if (_.isArray(models)) {
		return _.map(models, _.partial(_.pick, _, fields.split(',')));
	} else {
		return _.pick(models, fields.split(','));
	}
}

function selectVersionFiles(version, model) {
	return (_.find(model.assets, { version }) || {}).files;
}
