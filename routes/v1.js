import _ from 'lodash';
import express from 'express';

import db from '../db';
import config from '../config';
import * as v1 from '../lib/v1';

let router = new express.Router();

router.param('cdn', (req, res, next) => {
	let cdn = `v1/${String(req.params.cdn).toLowerCase()}`;
	let collectionConfig = _.find(config.cdnCollections, collectionConfig => collectionConfig.name === cdn || _.includes(collectionConfig.aliases, cdn));

	if (collectionConfig) {
		req.collection = db[collectionConfig.name];
		next();
	} else {
		let error = new Error(`Invalid CDN requested: ${cdn}`);
		error.code = 400;
		v1.respond(error, {}, req, res);
	}
});

router.get('/:cdn/libraries', (req, res) => {
	v1.find(req.collection, req.query, (err, result) => {
		v1.respond(err, result, req, res);
	});
});

router.get('/:cdn/libraries/:name', (req, res) => {
	req.query.name = req.params.name;

	v1.findOne(req.collection, req.query, (err, result) => {
		v1.respond(err, result, req, res);
	});
});

router.get('/:cdn/libraries/:name/:version', (req, res) => {
	req.query.name = req.params.name;
	req.query.version = req.params.version;

	v1.findOne(req.collection, req.query, (err, result) => {
		v1.respond(err, result, req, res);
	});
});

export default router;
