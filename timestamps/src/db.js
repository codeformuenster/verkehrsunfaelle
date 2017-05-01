"use strict";

const pg = require("pg"), QueryStream = require("pg-query-stream");

const connectionOptions = {
  //host: 'postgis',
  host: "localhost",
  user: "postgres",
  password: "unfaelle_aua_aua",
  database: "ms_unfaelle"
};

const client = new pg.Client(connectionOptions);

const initDB = function initDB(cb) {
  client.connect(function(err) {
    if (err) {
      throw err;
    }
    cb(client);
  });
};

const disconnect = function disconnect(cb) {
  return client.end(cb);
};

const queryStream = function queryStream(query, args) {
  return new QueryStream(query, args);
};

const INSERT_QUERY =
  "INSERT INTO unfalldaten_timestamps (unfall_id, parsed_timestamp, missing_time, missing_date, used_format, parsed_german_weekday, original_german_weekday, incorrect_original_weekday) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";

const persist = function persist(unfall_id, parsed_timestamp, missing_time, missing_date, used_format, parsed_german_weekday, original_german_weekday, incorrect_original_weekday) {
  return client.query(INSERT_QUERY, [
    unfall_id,
    parsed_timestamp,
    missing_time,
    missing_date,
    used_format,
    parsed_german_weekday,
    original_german_weekday,
    incorrect_original_weekday
  ]);
};

const getContext = function getContext(id) {
  return client.query("SELECT * FROM unfalldaten_timestamps WHERE unfall_id between $1 and $2", [id - 10, id + 10]);
};

module.exports = {
  initDB,
  queryStream,
  persist,
  disconnect,
  getContext
};
