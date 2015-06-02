var levenshtein = require('underscore.string/levenshtein');

// -1 means no match otherwise proximity from query to str. 0 means exact match
module.exports = function compareNames(str, query) {
  // minimatch takes precidence
  if (str !== query.$regex.source) {
    return query.$regex.test(str) ? 0 : -1;
  }
  var score = levenshtein(str, query.$val);
  return score <= Math.min(str.length, 3) ? score : -1;
};
