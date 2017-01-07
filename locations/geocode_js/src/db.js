'use strict';

const pg = require('pg'),
  QueryStream = require('pg-query-stream');

const connectionOptions = {
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

const INSERT_QUERY = 'INSERT INTO unfalldaten_geometries (unfall_id, source, created_at, the_geom) VALUES ($1, $2, NOW(), ST_GeomFromText($3, 4326))';

const lonlatToPostgis = function lonlatToPostgis (lon, lat) {
  return `POINT(${lon} ${lat})`;
};

const persist = function persist (unfall_id, lon, lat, source) {
  return new Promise(function (resolve, reject) {
    client.query(INSERT_QUERY, [unfall_id, source, lonlatToPostgis(lon, lat)], function (err, result) {
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
