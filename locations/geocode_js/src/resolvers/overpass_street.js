'use strict';

const request = require('request-promise-native');

const host = 'proxy';
const overpass_url = `http://${host}/api/interpreter`;
const bbox = '51.8401448,7.4737853,52.0600251,7.7743634';

const capitalize = function capitalize (s) {
  return s && `${s[0].toUpperCase()}${s.slice(1)}`;
};

const allowedTerms = ['platz', 'strasse', 'straße', 'damm', 'stiege', 'weg', 'mühle', 'burg', 'ring', 'georgskommende', 'pfad', 'tor', 'allee', 'nevinghoff', 'schanze', 'graben', 'heide', 'markt', 'breul', 'bült', 'bogen', 'asche', 'kirche', 'am burloh', 'eck', 'busch', 'gasse', 'nottebrock', 'kamp', 'garten', 'kreuz', 'hege', 'ufer', 'kleimannbrücke', 'ziegelei', 'mittelhafen', 'rieselfeld', 'see', 'feld', 'kotten', 'kanal', 'brock', 'campus', 'krummer timpen', 'woort', 'haskenau', 'haus', 'hoek'];
const allowedTermsCapitalized = [];

for (const term of allowedTerms) {
  allowedTermsCapitalized.push(capitalize(term));
}


const checkAgainstTerms = function (name) {
  for (let i = 0, len = allowedTerms.length; i < len; i++) {
    if (name.includes(allowedTermsCapitalized[i]) || name.includes(allowedTerms[i])) {
      return true;
    }
  }

  return false;
};

module.exports = function overpass (streetNameA, streetNameB) {
  let placeName = '';
  if (streetNameA !== '' && !streetNameA.includes('parkplatz') && !streetNameA.includes('Parkplatz') &&
      checkAgainstTerms(streetNameA)
  ) {
    placeName = streetNameA;
  }
  if (streetNameB !== '' && !streetNameB.includes('parkplatz') && !streetNameB.includes('Parkplatz') &&
      checkAgainstTerms(streetNameB)
  ) {
    placeName = `${placeName}|${streetNameB}`;
  }

  if (placeName === '') {
    return Promise.resolve({ resolver: 'overpass_place', subject: `${streetNameA} ${streetNameB}`, results: [] });
  }
  const payload = `[bbox:${bbox}][out:json];way[highway][~"name"~"${placeName}",i];out center qt;`;

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

      return { resolver: 'overpass_place', subject: `${streetNameA} ${streetNameB}`, results: coords };
    });
};
