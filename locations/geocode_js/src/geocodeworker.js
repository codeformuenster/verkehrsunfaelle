'use strict';

const resolvers = require('./resolvers'),
  forOf = require('async-for-of'),
  turfHelpers = require('@turf/helpers'),
  centroid = require('@turf/centroid'),
  DB = require('./db'),
  ora = require('ora'),
  normalize = require('./normalizer');

const { point, featureCollection } = turfHelpers;

module.exports = function geocodeworker (task, worker_callback) {
  let { vu_ort, vu_hoehe } = task;
  if (vu_hoehe === null) {
    vu_hoehe = '';
  }
  vu_hoehe = normalize(vu_hoehe);
  vu_ort = normalize(vu_ort);

  const spinner = ora({
    text: `Geocoding ${task.id} ${vu_ort} ${vu_hoehe} ...`,
    spinner: 'arc'
  }).start();

  const resolverNames = ['overpass', 'overpass_addr', 'overpass_around', 'nominatim'];
  let currResolverName;

  forOf(resolverNames, function (item, next, end) {
    currResolverName = item;
    const resolver = resolvers[item];

    resolver(vu_ort, vu_hoehe)
      .then(function (result) {
        if (result.results.length !== 0) {
          result.subject_id = task.id;

          return end(result);
        }

        return next();
      })
      .catch(function (err) {
        end(err);
        worker_callback(err);
      });
  })
  .then(function (result) {
    if (!result) {
      spinner.text = `NOTHING FOUND FOR ${task.id} {${vu_ort}} {${vu_hoehe}} ({${task.vu_ort}} {${task.vu_hoehe}})`;
      spinner.fail();

      return worker_callback(null, `${task.id},${vu_ort},${vu_hoehe},${task.vu_ort},${task.vu_hoehe}`);
    }

    const result_centroid = centroid(featureCollection(result.results.map(r => point([r.lon, r.lat]))));

    DB.persist(task.id, result_centroid.geometry.coordinates[0], result_centroid.geometry.coordinates[1], result.resolver)
      .then(function () {
        spinner.text = `Successfully geocoded ${task.id} ${vu_ort} ${vu_hoehe} with ${currResolverName}`;
        spinner.succeed();
        worker_callback(null);
      })
      .catch(function (err) {
        spinner.text = `Error for ${task.id} ${vu_ort} ${vu_hoehe} ${err.message}`;
        spinner.fail();
        worker_callback(err, `${task.id},${vu_ort},${vu_hoehe}`);
      });


  });

};

