'use strict';

const request = require('request-promise-native');

const host = 'localhost:8080',
  url = `http://${host}/search.php`;
//const bbox = '7.7336883544921875,52.014472235614164,7.522888183593749,51.88454447438394';
const bbox = '7.7743634,52.0600251,7.4737853,51.8401448';

module.exports = function nominatim (streetNameA, streetNameB) {
  const searchString = encodeURIComponent(`${streetNameA} ${streetNameB} Münster`);
  const queryString = Object.entries({
    q: searchString,
    format: 'json',
    countrycodes: 'de',
    viewbox: bbox,
    bounded: '1',
    dedupe: '1'
  })
    .map(e => e.join('='))
    .join('&');

  const queryUrl = `${url}?${queryString}`;

  return request.post(queryUrl)
    .then(function (result) {
      //console.log(result);
      const json = JSON.parse(result);

      // map results to array containing { lat, lon } objects
      const coords = json.map(function (item) {
        let { lat, lon } = item;

        lat = parseFloat(lat);
        lon = parseFloat(lon);

        return { lat, lon };
      });

      return { resolver: 'nominatim', subject: `${streetNameA} ${streetNameB}`, results: coords };
    });
};

