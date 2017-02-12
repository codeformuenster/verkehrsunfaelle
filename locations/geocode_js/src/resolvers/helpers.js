'use strict';

const houseNumberRegex = /(\d+)\s?(?:([a-zA-Z]{1})\b)?/i

const extractHousenumber = function extractHousenumber (str) {
  if (str.match(/\d+\s?[a-zA-Z]/i)) {
    let outstr;
    houseNumberRegex[Symbol.replace](str, function (_, p1, p2) {
      outstr = [p1, p2].join('');
    });
    return outstr;
  }

  return str;
};

module.exports = {
  extractHousenumber
};
