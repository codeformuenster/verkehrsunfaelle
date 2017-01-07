'use strict';

const DB = require('./src/db'),
  streamgeocoder = require('./src/streamgeocoder');

DB.initDB(function (client) {
  //const query = DB.queryStream('SELECT id, vu_ort, vu_hoehe FROM unfalldaten_raw where vu_hoehe is null limit 1');
  const query = DB.queryStream('SELECT id, vu_ort, vu_hoehe FROM unfalldaten_raw LIMIT 2000');
  const stream = client.query(query);

  //release the client when the stream is finished
  stream.pipe(streamgeocoder()).pipe(process.stdout);
});

