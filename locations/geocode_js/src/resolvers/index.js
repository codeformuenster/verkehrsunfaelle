'use strict';

const overpass = require('./overpass'),
  overpass_addr = require('./overpass_addr'),
  overpass_around = require('./overpass_around'),
  overpass_street = require('./overpass_street'),
  nominatim = require('./nominatim');


module.exports = {
  overpass,
  overpass_addr,
  overpass_around,
  overpass_street,
  nominatim
};
