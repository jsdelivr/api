var compare = require('./semver_loose').sort;


module.exports = function(arr) {
    if(!arr) {
        return;
    }

    return arr.slice().sort(compare).reverse();
};
