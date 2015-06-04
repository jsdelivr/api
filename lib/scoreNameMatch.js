var levenshtein = require("underscore.string/levenshtein");

// -1 means no match otherwise proximity from query to str. 0 means exact match
module.exports = function compareNames(lib, query) {
  // Apply either minimatching or levenshtein distance
  // minimatch takes precidence
  if (query.regex) {
    return query.regex.test(lib.name) ?
            // Score based on how close the string is to the name
            Math.max(lib.name.length - query.val.length, 0) :
            -1;
  }
  var score = levenshtein(lib.name, query.val);
  return score <= Math.sqrt(lib.name.length) ? score : -1;
};
