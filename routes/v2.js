import _ from 'lodash';
import express from 'express';

import db from '../db';
import config from '../config';
import * as v2 from '../lib/v2';

let router = new express.Router();

router.param('cdn', (req, res, next) => {
	let cdn = `v2/${String(req.params.cdn).toLowerCase()}`;
	let collectionConfig = _.find(config.cdnCollections, collectionConfig => collectionConfig.name === cdn || _.includes(collectionConfig.aliases, cdn));

	if (collectionConfig) {
		req.collection = db[collectionConfig.name];
		next();
	} else {
		let error = new Error(`Invalid CDN requested: ${cdn}`);
		error.code = 400;
		v2.respond(error, {}, req, res);
	}
});

router.get('/:cdn/libraries/:name?', (req, res) => {
	if (req.params.name) {
		req.query.name = req.params.name;
	}

	v2.find(req.collection, req.query, (err, result) => {
		v2.respond(err, result, req, res);
	});
});

router.get('/:cdn/library/:name?', (req, res) => {
	if (req.params.name) {
		req.query.name = req.params.name;
	}

	v2.findOne(req.collection, req.query, (err, result) => {
		v2.respond(err, result, req, res);
	});
});

router.get('/:cdn/library/:name/:version', (req, res) => {
	req.query.name = req.params.name;
	req.query.version = req.params.version;

	v2.findOne(req.collection, req.query, (err, result) => {
		v2.respond(err, result, req, res);
	});
});

router.get('/analytics/:library', (req, res) => {
	v2.hits(req.params.library, req.query, (err, result) => {
		v2.respond(err, result, req, res);
	});
});

export default router;
