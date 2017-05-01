"use strict";

const forOf = require("async-for-of"), DB = require("./db"), moment = require("moment-timezone");

const dateformats = [
  //"D/M/YYYY H:mm",
  "D/M/YYYY HH:mm",

  "DD/MM/YY HH:mm",
  //"DD/MM/YY H:mm",
  "DD/MM/YY",

  "M/D/YYYY HH:mm",
  //"M/D/YYYY H:mm",

  "DD.MM.YYYY HH:mm",

  "MM/DD/YYYY",
  "MM/D/YYYY",
  "M/D/YYYY"

  //  'DD/MM/YYYY HH:mm',
  //  'DD/MM/YY HH:mm'
  //
  //  'M/D/YY H:mm'
  //  'MM/DD/YY H:mm'
  //  'MM/DD/YYYY H:mm'
];

const extractDateTimePieces = function extractDateTimePieces(raw_unfall) {
  const { datum, uhrzeit } = raw_unfall;
  const tag = raw_unfall.tag.substr(0, 2).toLowerCase();

  let missing_time = false, missing_date = false;

  let theString = "";

  if (!datum) {
    missing_date = true;
  } else {
    theString = `${datum}`;
  }

  if (!uhrzeit || !uhrzeit.includes(":")) {
    missing_time = false;
  } else {
    if (uhrzeit.length === 4) {
      theString = `${theString} 0${uhrzeit}`;
    } else {
      theString = `${theString} ${uhrzeit}`;
    }
  }

  return {
    theString,
    missing_date,
    missing_time,
    tag
  };
};

const momentParse = function momentParse(str, format) {
  moment.locale("de");

  return moment.tz(str, format, true, "Europe/Berlin");
};

const compareWeekDay = function compareWeekDay(moment, weekDay) {
  return moment.format("dd").toLowerCase() !== weekDay;
};

const checkMomentIsValid = function checkMomentIsValid(moment) {
  return !moment.isValid();
};

const _timestampworker = function _timestampworker(task, compareWeekDay_param, worker_callback) {
  const { theString, tag, missing_date, missing_time } = extractDateTimePieces(task);

  let formats = dateformats.slice();
  let currFormat = formats.shift();

  let whileConditionFunc = compareWeekDay;

  if (compareWeekDay_param === false) {
    whileConditionFunc = checkMomentIsValid;
  }

  let parsed = momentParse(theString, currFormat);
  while (whileConditionFunc(parsed, tag)) {
    if (formats.length === 0) {
      break;
    }
    currFormat = formats.shift();
    parsed = momentParse(theString, currFormat);
  }

  if (parsed.isValid()) {
    DB.persist(task.id, parsed.format(), missing_time, missing_date, currFormat, parsed.format("dd").toLowerCase(), tag, parsed.format("dd").toLowerCase() !== tag)
      .then(function() {
        worker_callback(null);
      })
      .catch(function(err) {
        console.log(err);
        console.log(task.id, theString, tag, parsed.format("dd"));
        process.exit();
      });
  } else {
    worker_callback(null);
  }
};

module.exports = function timestampworker(task, worker_callback) {
  _timestampworker(task, true, worker_callback);
};

module.exports.extractDateTimePieces = extractDateTimePieces;
module.exports.momentParse = momentParse;
module.exports._timestampworker = _timestampworker;
