'use strict';

const DB = require('./src/db'),
  streamgeocoder = require('./src/streamgeocoder'),
  fs = require('fs');

DB.initDB(function (client) {
  let queryString = 'SELECT id, vu_ort, vu_hoehe FROM unfalldaten_raw';
  //const ids = fs
  //  .readFileSync(`${__dirname}/src/failed.csv`)
  //  .toString()
  //  .split('\n')
  //  .map(l => l.split(',')[0]);
  //ids.pop();
  //queryString = `${queryString} WHERE id IN (${ids.join(',')})`;

  const query = DB.queryStream(queryString);
  const stream = client.query(query);

  //release the client when the stream is finished
  const s = streamgeocoder();
  s.on('error', function (err) {
    console.log(err);
  });
  stream.pipe(s).pipe(process.stdout);
});

