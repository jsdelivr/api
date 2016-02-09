import _ from 'lodash';
import minimatch from 'minimatch';
import levenshtein from 'underscore.string/levenshtein';

import hasParam from '../lib/hasParam';
import ApiError from '../lib/ApiError';
import db from '../db';

let v2Keys = Object.keys(db.v2Schema);

// search for multiple libraries
export function find (collection, query, cb) {
	let namePattern = buildNamePattern(query.name);
	let libraries = applyParams(collection, query);

	if (namePattern) {
		libraries = _(libraries).transform((result, library) => {
			let score = getNameScore(library, namePattern);

			if (score >= 0) {
				result.push({ score, library });
			}
		})
			.sortBy('score')
			.pluck('library')
			.value();
	}

	return cb(null, selectFields(query.fields, libraries));
}
// search for one library
export function findOne (collection, query, cb) {
	if (!hasParam('v2', query)) {
		return cb(new ApiError('A query must be specified. Refer to our documentation at https://github.com/jsdelivr/api', 404));
	}

	let namePattern = buildNamePattern(query.name);
	let libraries = applyParams(collection, query);
	let model;

	if (namePattern) {
		model = _(libraries).transform((result, library) => {
			let score = getNameScore(library, namePattern);

			if (score > -1) {
				result.push({ score, library });
			}

			// break on exact match
			if (score === 0) {
				return false;
			}
		})
			.sortBy('score')
			.pluck('library')
			.first();
	} else {
		model = _.first(libraries);
	}

	if (!model) {
	    return cb(new ApiError('Requested project not found.', 404));
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

export function hits (project, query, cb) {
	let sql = global.KNEX.sqlClient.from('results')
		.where({ project })
		.where('date', '>', query.date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
		.orderBy('date', 'desc');

	if (query.date_to) {
		sql.where('date', '<', query.date_to);
	}

	sql.select('date', 'hits').then((rows) => {
		let result = {};

		_.each(rows, (row) => {
			result[new Date(row.date).toISOString().split('T')[0]] = row.hits;
		});

		cb(null, result);
	}).catch(cb);
}

export function respond (err, result, req, res) {
	if (err) {
		let error = {
			status: err.code || 500,
			message: err.message || err,
			url: req.url
		};

		res.status(error.status).json(error);
	} else {
		res.status(200).json(result);
	}
}

function applyParams (collection, query) {
	let params = _.mapValues(_.pick(_.omit(query, [ 'name' ]), v2Keys), (val) => {
		return { '$regex': minimatch.makeRe(val, { nocase: true }) };
	});

	if (params.length < 1) {
		return collection.data;
	}

	return collection.find(params);
}

function buildNamePattern (name) {
	if (!name) {
		return null;
	}

	let result = {};
	result.val = name;

	if (~name.indexOf(',')) {
		result.regex = minimatch.makeRe(`{${name}}`);
	} else if (~name.indexOf('*')) {
		result.regex = minimatch.makeRe(name);
	}

	return result;
}

function getNameScore (lib, query) {
	if (query.regex) {
		return query.regex.test(lib.name)
			? Math.max(lib.name.length - query.val.length, 0)
			: -1;
	}

	let score = levenshtein(lib.name, query.val);
	return score <= Math.sqrt(query.val.length) ? score : -1;
}

function selectFields (fields, models) {
	if (_.isArray(models) && (typeof fields !== 'string' || !fields || !~fields.indexOf('assets'))) {
		models = _.map(models, model => _.omit(model, 'assets'));
	}

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
	return (_.find(model.assets, (value, key) => key === version) || {}).files;
}
