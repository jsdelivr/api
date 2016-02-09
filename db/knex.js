import config from '../config';
import Knex from 'knex';

let knex = Knex({
	client: 'mysql',
	connection: {
		host: config.sql.host,
		user: config.sql.user,
		password: config.sql.password,
		database: config.sql.database,
	},
	debug: false,
});

export default {
	sqlClient: knex
};
