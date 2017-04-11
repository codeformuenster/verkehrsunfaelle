'use strict';

const forOf = require('async-for-of'),
  DB = require('./db'),
  ora = require('ora'),
  moment = require('moment');

const dateformats = [
  'D/M/YYYY H:mm',
  'D/M/YYYY HH:mm',

  'DD/MM/YY HH:mm',
  'DD/MM/YY H:mm',
  'DD/MM/YY',

  'M/D/YYYY HH:mm',
  'M/D/YYYY H:mm',

  'DD.MM.YYYY HH:mm',

  'MM/DD/YYYY',
  'MM/D/YYYY',
  'M/D/YYYY',


//  'DD/MM/YYYY HH:mm',
//  'DD/MM/YY HH:mm'
//
//  'M/D/YY H:mm'
//  'MM/DD/YY H:mm'
//  'MM/DD/YYYY H:mm'
];

module.exports = function timestampworker (task, worker_callback) {
  let { datum, uhrzeit, tag} = task;
  let missing_time = false,
    missing_date = false;

  //const spinner = ora({
  //  text: `Parsing ${task.id} '${datum}' '${uhrzeit}' ...`,
  //  spinner: 'arc'
  //}).start();

  let theString = '';

  tag = tag.substr(0, 2).toLowerCase();


  if (!datum) {
    missing_date = true;
  } else {
    theString = `${datum}`;
  }

  if (!uhrzeit || !uhrzeit.includes(':')) {
    missing_time = false;
  } else {
    theString = `${theString} ${uhrzeit}`;
  }

  let formats = dateformats.slice();

  let parsed = moment.utc(theString, formats.shift(), 'de', true);
  while (!parsed.isValid() && parsed.format('dd').toLowerCase() !== tag) {
    if (formats.length === 0) {
      console.log(task.id, theString, tag, parsed.format('dd'));
      process.exit();
    }
    parsed = moment.utc(theString, formats.shift(), 'de', true);
  }

  DB.persist(task.id, parsed.format(), missing_time, missing_date)
    .then(function () {
       worker_callback(null);
    })
    .catch(function (err) {
      console.log(err);
      console.log(task.id, theString, tag, parsed.format('dd'));
      process.exit();
    });


};

