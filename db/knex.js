/**
 * Created by austin on 7/20/15.
 */

"use strict";

import config from "../config";
import Knex from "knex";

var knex = Knex({
  client: 'mysql',
  connection: {
    host: config.sql.host,
    user: config.sql.user,
    password: config.sql.password,
    database: config.sql.database
  },
  debug: false
});

module.exports = {
  sqlClient: knex
};
