'use strict';

const request = require('request-promise-native'),
  queue = require('async/queue'),
  streets = require('./src/streets');

const host = 'localhost';
const overpass_url = `http://${host}/api/interpreter`;

const handle = function (result) {
  const json = JSON.parse(result);

  if (json.elements.length === 0) {
    console.log(json);
  }

};

const handleErr = function (err) {
  console.log(err);
};

const q = queue(function (task, callback) {
  return request.post(overpass_url, { form: { data: `[out:json];way[~"name"~"${task}"];(._;>;);out;` } })
    .then(function (result) {
      const json = JSON.parse(result);

      if (json.elements.length === 0) {
        console.log(task);
      }

      callback(null);
    })
    .catch(handleErr);
}, 10);

q.drain = function () {
  console.log('done');
}

for (const street of streets) {
  q.push(street);
}

