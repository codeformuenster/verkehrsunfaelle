"use strict";

const DB = require("./src/db");
const timestampworker = require("./src/timestampworker");
const each = require("async/each");

DB.initDB(function(client) {
  let queryString = "SELECT id, datum, uhrzeit, tag FROM unfalldaten_raw WHERE id NOT IN (SELECT unfall_id FROM unfalldaten_timestamps)";

  client
    .query(queryString)
    .then(function(result) {
      each(result.rows, handleFailed, function(err) {
        console.log(err);
        DB.disconnect(err => {
          console.log(err ? `Error disconnecting db :${err}` : "disconnected from db");
        });
      });
    })
    .catch(function(err) {
      console.log(err);
      process.exit();
    });
});

const handleFailed = function handleFailed(raw_unfall, callback) {
  const { theString, tag, missing_date, missing_time } = timestampworker.extractDateTimePieces(raw_unfall);

  DB.getContext(raw_unfall.id)
    .then(function(context_unfaelle) {
      // exit when nothing was found :(
      if (context_unfaelle.rowCount === 0) {
        callback(`context_unfall was empty for ${raw_unfall.id}`);
      }

      let parsed;
      // rows are in context_unfaelle.rows
      // iterate backwards. we suspect the most correct silbling at the end of the array
      let foundSomething = false;
      for (const unfall of context_unfaelle.rows) {
        parsed = timestampworker.momentParse(theString, unfall.used_format);
        if (parsed.format("dd").toLowerCase() === unfall.parsed_german_weekday) {
          foundSomething = true;
          DB.persist(
            raw_unfall.id,
            parsed.format(),
            missing_time,
            missing_date,
            unfall.used_format,
            parsed.format("dd").toLowerCase(),
            tag,
            parsed.format("dd").toLowerCase() !== tag
          )
            .then(function() {
              callback();
            })
            .catch(function(err) {
              console.log(err);
              process.exit();
            });
          break;
        }
      }
      if (!foundSomething) {
        timestampworker._timestampworker(raw_unfall, false, callback);
      }
    })
    .catch(function(err) {
      console.log(err);
      process.exit();
    });
};
