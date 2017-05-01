"use strict";

const DB = require("./src/db"), streamtimestampparser = require("./src/streamtimestampparser");

DB.initDB(function(client) {
  let queryString = "SELECT id, datum, uhrzeit, tag FROM unfalldaten_raw";

  const query = DB.queryStream(queryString);
  const stream = client.query(query);

  //release the client when the stream is finished
  const s = streamtimestampparser();
  s.on("error", function(err) {
    console.log(err);
  });
  stream.pipe(s).pipe(process.stdout);
});
