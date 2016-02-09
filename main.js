import Promise from 'bluebird';
import express from 'express';
import morgan from 'morgan';

import db from './db';
import config from './config';
import log from './lib/log';

let taskUpdating = {};

export default function () {
	handleExit();

	return serve().then(() => {
		return runTasks();
	}).catch((error) => {
		if (error) {
			log.err(`Error starting application!`);
			log.err(error);
			process.exit();
		}
	});
}

let intervalSet = false;

function runTasks () {
	return new Promise((resolve) => {
		let tasks = Object.keys(config.tasks);

		log.info(`Running tasks: ${tasks.join(',')}`);

		return Promise.mapSeries(tasks, (name) => {
			taskUpdating[name] = false;
			return runTask(name);
		}).catch((error) => {
			log.err(`Error initializing tasks`);
			log.err(error);
		}).then(() => {
			if (!intervalSet) {
				intervalSet = true;
				let interval = 6 * (10 * 1e4);

				// we want to space out the start of each sync cycle by 10 minutes each
				setInterval(() => {
					runTasks().then(() => {
						log.info(`Libraries synced!`);
					});
				}, interval);
			}

			resolve();
		});
	});
}

function runTask (name) {
	return new Promise((resolve) => {
		if (!taskUpdating[name]) {
			taskUpdating[name] = true;

			log.info(`Running task ${name}...`);

			try {
				require(`./tasks/${name}`)(db).then(() => {
					log.info(`Task ${name} complete`);

					taskUpdating[name] = false;
					resolve();

					log.info(`Purging cache`);

					require('./lib/purge')(config.maxcdn)().then(() => {
						log.info(`Cache purged`);
					}).catch((error) => {
						log.err(`Error purging cache`);
						log.err(error);
					});
				}).catch((error) => {
					log.err(`Error running task ${name}`);
					log.err(error);
					resolve();
				});
			} catch (error) {
				log.err(`Couldn't run task ${name}`);
				log.err(error);
				resolve();
			}
		} else {
			log.info(`Task ${name} is already running`);
			resolve();
		}
	});
}

function serve () {
	return new Promise((resolve) => {
		let app = express();
		let port = config.port;

		app.use(morgan('dev'));
		app.set('json spaces', 2);

		// setup CORS
		app.use(function (req, res, next) {
			res.header('Access-Control-Allow-Origin', '*');
			next();
		});

		// v1 routes
		app.use('/v1', require('./routes/v1'));

		// catch all
		app.all('*', function (req, res) {
			res.status(404).jsonp({ status: 404, message: `Requested url ${req.url} not found.` });
		});

		app.listen(port, function () {
			log.info(`Node (version: ${process.version}) ${process.argv[ 1 ]} started on ${port} ...`);
			resolve(app);
		});
	});
}

function handleExit () {
	process.on('exit', terminator);

	[ 'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
		'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
	].forEach((element) => {
		process.on(element, () => {
			terminator(element);
		});
	});
}

function terminator (sig) {
	// close loki db
	db.db.close();

	if (typeof sig === 'string') {
		log.info(`${sig}: Received ${new Date()} - terminating Node server`);
		process.exit(1);
	}

	log.info(`${new Date()}: Node server stopped`);
}
