'use strict';

const request = require('request-promise-native'),
  helpers = require('./helpers');

const host = 'proxy';
const overpass_url = `http://${host}/api/interpreter`;
const bbox = '51.8401448,7.4737853,52.0600251,7.7743634';

module.exports = function overpass_addr (streetNameA, streetNameB) {
  if (streetNameB === '') {
    return Promise.resolve({ resolver: 'overpass_addr', subject: `${streetNameA} ${streetNameB}`, results: [] });
  }

  streetNameB = helpers.extractHousenumber(streetNameB);

  const payload = `[bbox:${bbox}][out:json];(way[~"addr:street"~"${streetNameA}",i]["addr:housenumber"="${streetNameB}"];way[~"disused:addr:street"~"${streetNameA}",i]["disused:addr:housenumber"="${streetNameB}"];way[~"ref"~"${streetNameA}",i]["disused:addr:housenumber"="${streetNameB}"]);out qt center;`;

  return request.post(overpass_url, { form: { data: payload } })
    .then(function (result) {
      const json = JSON.parse(result);

      // map results to array containing { lat, lon } objects
      const coords = json.elements.map(function (item) {
        let lat, lon;
        if (item.center) {
          lat = item.center.lat;
          lon = item.center.lon;
        } else {
          lat = item.lat;
          lon = item.lon;
        }

        return { lat, lon };
      });

      return { resolver: 'overpass_addr', subject: `${streetNameA} ${streetNameB}`, results: coords };
    });
};


