'use strict';

const extractHousenumber = function extractHousenumber (str) {
  if (str.match(/^\d+[a-zA-Z]*/i)) {
    const newStr = str.substring(0, str.indexOf(' '));
    if (newStr.match(/^\d+[a-zA-Z]*$/i)) {
      return newStr;
    }
  }

  return str;
};

module.exports = {
  extractHousenumber
};
