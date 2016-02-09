import _ from 'lodash';

import db from '../db';

const queryFields = {
	v1: Object.keys(db.v1Schema),
	v2: Object.keys(db.v2Schema)
};

export default function hasParam (version, query) {
	return _.any(queryFields[version], field => _.has(query, field));
}
