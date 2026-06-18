import util from 'util';
import winston from 'winston';

let logger = winston.createLogger({
	levels: {
		err: 0,
		warning: 1,
		info: 2,
	},
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ timestamp, level, message }) => {
			return `${timestamp} ${level} ${message}`;
		}),
	),
	transports: [
		new winston.transports.Console(),
	],
});

function formatMessage (value) {
	if (value instanceof Error) {
		return value.stack || value.message;
	}

	if (typeof value === 'string') {
		return value;
	}

	return util.inspect(value, { depth: null, colors: false });
}

let log = {
	info: value => logger.info(formatMessage(value)),
	warning: value => logger.warning(formatMessage(value)),
	err: value => logger.err(formatMessage(value)),
	on: (...args) => logger.on(...args),
};

logger.on('error', (error) => {
	console.error('Logger error:', error);
});

export default log;
