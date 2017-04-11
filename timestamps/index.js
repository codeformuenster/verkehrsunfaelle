'use strict';

const DB = require('./src/db'),
  streamtimestampparser = require('./src/streamtimestampparser'),
  fs = require('fs');

DB.initDB(function (client) {
  let queryString = 'SELECT id, datum, uhrzeit, tag FROM unfalldaten_raw';
  //const ids = fs
  //  .readFileSync(`${__dirname}/src/failedrest.csv`)
  //  .toString()
  //  .split('\n')
  //  .map(l => l.split(',')[0]);
  //ids.pop();
  //queryString = `${queryString} WHERE id IN (${ids.join(',')})`;
  //queryString = `${queryString} WHERE id = 47380`;

  const query = DB.queryStream(queryString);
  const stream = client.query(query);

  //release the client when the stream is finished
  const s = streamtimestampparser();
  s.on('error', function (err) {
    console.log(err);
  });
  stream.pipe(s).pipe(process.stdout);
});
