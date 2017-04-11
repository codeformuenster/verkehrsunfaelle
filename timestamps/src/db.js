'use strict';

const pg = require('pg'),
  QueryStream = require('pg-query-stream');

const connectionOptions = {
  //host: 'postgis',
  host: 'localhost',
  user: 'postgres',
  password: 'unfaelle_aua_aua',
  database: 'ms_unfaelle'
};

const client = new pg.Client(connectionOptions);

const initDB = function initDB (cb) {
  client.connect(function (err) {
    if (err) {throw err;}
    cb(client);
  });
};

const disconnect = function disconnect (cb) {
  return client.end(cb);
};

const queryStream = function queryStream (query, args) {
  return new QueryStream(query, args);
};

const INSERT_QUERY = 'INSERT INTO unfalldaten_timestamps (unfall_id, parsed_timestamp, missing_time, missing_date) VALUES ($1, $2, $3, $4)';

const persist = function persist (unfall_id, parsed_timestamp, missing_time, missing_date) {
  return new Promise(function (resolve, reject) {
    client.query(INSERT_QUERY, [unfall_id, parsed_timestamp, missing_time, missing_date], function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  initDB,
  queryStream,
  persist,
  disconnect
};
