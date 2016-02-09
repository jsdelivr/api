require('babel/register');
module.exports = require('./main');

if (require.main === module) {
	module.exports();
}
