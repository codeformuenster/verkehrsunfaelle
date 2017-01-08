'use strict';

const fuzzyset = require('fuzzyset');

const fuzzy = fuzzyset(require('./streets'));

const dictionary = {
  'orleans': 'Orléans',
  'metzerstraße': 'Metzer Straße',
  'clevornstraße': 'Clevornstraße',
  'vorländerweg': 'Vorländerweg',
  'vorbergweg': 'Vorbergweg',
  'vor': '',
  'ggü.': '',
  'ggü': '',
  'pakrplatz': 'Parkplatz',
  'schiffahrter': 'Schifffahrter',
  '"': '',
  'habichtshöhe': 'Habichtshöhe',
  'maikottenhöhe': 'Maikottenhöhe',
  'höhe': '',
  'in höhe': '',
  'uhöhe': '',
  'jhöhe': '',
  '?': '',
  'fr.-Ebert-Str.': 'Friedrich-Ebert-Straße',
  'str.': 'straße',
  'helmholzweg': 'Helmholtzweg',
  'nr.': '',
  'hindenburgplatz': 'Schlossplatz',
  'zufahrt': '',
  'einfahrt': '',
  'fa.': '',
  'holspital': 'hospital'
};
const keys = Object.keys(dictionary).map(function (key) {
  return key.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
});

const regexp = RegExp(`(${keys.join('|')})`, 'ig');

// http://stackoverflow.com/a/14013664
const normalize = function normalize (text) {
  //if (
  //  !text.toLowerCase().startsWith('umgehung') ||
  //  !text.toLowerCase().startsWith('parkplatz')
  //) {
  //  const f = fuzzy.get(text);
  //  if (f && f[0] && f[0][0] && f[0][0] >= 0.6) {
  //    text = f[0][1];
  //  }
  //}

  let out = text
    .replace(regexp, function (_, word) {
      _ = dictionary[word.toLowerCase()];
      if (/^[A-Z][a-z]/.test(word)) // initial caps
        {_ = _.slice(0, 1).toUpperCase() + _.slice(1);}
      else if (/^[A-Z][A-Z]/.test(word)) // all caps
        {_ = _.toUpperCase();}

      return _;
    })
    .replace(/\s\s+/g, ' ')
    //.replace(/(^\d+[a-z]*)/,'$1')
    .trim();

  if (
       !out.toLowerCase().startsWith('umgehung')
    && !out.toLowerCase().startsWith('parkplatz')
    && !out.toLowerCase().startsWith('rewe')
    && !out.toLowerCase().startsWith('schule')
  ) {
    const f = fuzzy.get(out);
    if (f && f[0] && f[0][0] && f[0][0] >= 0.6) {
      out = f[0][1];
    }
  }

  return out;
};

module.exports = normalize;
