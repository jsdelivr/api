import Logger from 'le_node';
import config from '../config';

let log = new Logger({
	withStack: true,
	timestamp: true,
	console: true,
	token: config.logentriesToken,
	bufferSize: 4000,
});

log.on('error', (error) => {
	console.error('Logger error:', error);
});

export default log;
