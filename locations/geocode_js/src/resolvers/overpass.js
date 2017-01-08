'use strict';

const request = require('request-promise-native');

const host = 'proxy';
const overpass_url = `http://${host}/api/interpreter`;
const bbox = '51.8401448,7.4737853,52.0600251,7.7743634';

module.exports = function overpass (streetNameA, streetNameB) {
  if (streetNameB === '') {
    return Promise.resolve({ resolver: 'overpass', subject: `${streetNameA} ${streetNameB}`, results: [] });
  }
  const payload = `[bbox:${bbox}][out:json];way[highway][~"name"~"${streetNameA}",i];node(w)->.n1;way[highway][~"name"~"${streetNameB}",i];node(w)->.n2;node.n1.n2;out qt;`;

  return request.post(overpass_url, { form: { data: payload } })
    .then(function (result) {
      const json = JSON.parse(result);

      // map results to array containing { lat, lon } objects
      const coords = json.elements.map(function (item) {
        const { lat, lon } = item;

        return { lat, lon };
      });

      return { resolver: 'overpass', subject: `${streetNameA} ${streetNameB}`, results: coords };
    });
};


