var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var winstoon = require('winstoon');
var logger = winstoon.createLogger('deployer');
var fs = require('fs');

/**

	Deployer - Responsible for deploying the app retreived from the GIT

	@param gitpath - Path where GIT based project exists
	@param appspath - where apps goona deployed
	@param eventBus - eventEmitter

	Events
	------
	
	@param port - the port app is running
	@param code - the exit code of the code
	appKilled(port, code)

*/
exports.load = function(gitpath, appspath, eventBus) {
	return new Deployer(gitpath, appspath, eventBus);
}

function Deployer(gitpath, appspath, eventBus) {

	var masterApp = null;
	var workers = {}; //set of workers deployed (inlcuding the original deployment)
	var killingApp = {} //ports where app is triggered to be killed
	
	/**
		Deploy the app into the given port

		@param port - where app need to started
		@param logFile - where the logfile output should send
		@param callback - calls after the complete deployment
			
			@param err - error object if exists
			@param pid - pid of the deployed app
			function(err, pid) {}
	*/
	this.deploy = function deploy(port, logFile, callback) {
		
		//git pull
		logger.info('getting pit pull', {gitpath: gitpath, port: port});

		exec('git pull origin master', {cwd: gitpath}, function(err, output) {
			if(!err) {

				copyApp();
			} else {
				logger.error('Git pull execution error', {err: err, path: gitpath});
				callback(err);
			}
		});

		//copy the app
		var appLocation = appspath + '/' + port;
		function copyApp() {
			
			logger.info('creating new app directory', {dir: appLocation, port: port});
			exec('rm -rf ' + appLocation + ' && mkdir -p ' + appLocation, afterDirCreated);	
		}

		function afterDirCreated(err, output) {
			
			if(!err) {
				logger.info('copying git dir into the new app Location', {gitpath: gitpath, appspath: appspath});
				exec('cp ' + gitpath + '/* ' + appLocation + ' -r', afterCopied);
			} else {
				logger.error('error when creating the new app directory', {dir: appLocation, port: port});
				callback(err);
			}
		}

		//invoke the init.sh script
		function afterCopied(err, output) {
			
			if(!err) {
				logger.info('invoking the init.sh', {appLocation: appLocation});
				exec('./init.sh', {cwd: appLocation}, afterExecutedInitSh);
			} else {
				logger.error('copying the app has aborted', {err: err, port: port});
				callback(err);
			}
		}

		//invoke npm install
		function afterExecutedInitSh(err, output) {
		
			if(err) {
				logger.error('failed to execute init.sh', {err: err, port: port});
			} 

			logger.info('npm install', {appLocation: appLocation, port: port});
			exec('npm install', {cwd: appLocation}, afterNpmInstalled);
		};

		function afterNpmInstalled(err, output) {
			
			if(!err) {

				//kill the app if already created 
				if(workers[port]) {
					killingApp[port] = true; //mark the app is scheduled to be kill
					workers[port].kill('SIGQUIT');
				}

				//spawn the app
				logger.info('invoking the app', {port: port});
				var app = spawnAnApp(port, appLocation, logFile);
		
				workers[port] = app;
				masterApp = {port: port, pid: app.pid, path: appLocation};

				callback(null, app.pid);
			
			} else {
				logger.error('failed npm install', {err: err, port: port});
				callback(err);
			}
		}

	};

	/**
		Add a worker to the currently deployed app

		@param port - where app need to started
		@param logFile - where the logfile output should send
		@param callback - calls after the complete deployment
			
			@param err - error object if exists
			@param pid - pid of the deployed app
			function(err, pid) {}
	*/
	this.addWorker = function(port, logFile, callback) {
		
		if(masterApp) {

			//kill the app if already created 
			if(workers[port]) {
				killingApp[port] = true; //mark the app is scheduled to be kill
				workers[port].kill('SIGQUIT');
			}
			
			var appLocation = masterApp.path;
			var logFd = fs.openSync(logFile, 'a+');
			var app = spawnAnApp(port, appLocation, logFile);
	
			workers[port] = app;
			callback(null, app.pid);

		} else {
			logger.error('No app deployed yet');
			callback({message: 'No app deployed yet'});
		}
	};


	/**
		Spawn and app on a new process and return it
	*/
	function spawnAnApp(port, appLocation, logFile) {
		
		var logFd = fs.openSync(logFile, 'a+');

		logger.info('invoking the app for worker', {port: port});
		var app = spawn('node', ['start.js', port], {cwd: appLocation});

		//emit about the app
		logger.info('worker started', {pid: app.pid});

		app.stdout.on('data', function (data) {
			fs.write(logFd, data.toString('utf8'));
		});

		app.stderr.on('data', function (data) {
			fs.write(logFd, data.toString('utf8'));
		});

		app.on('exit', function (code) {
			fs.close(logFd);
		  	
		  	if(killingApp[port]) { // app is scheduled to kill
		  		delete killingApp[port];
		  		logger.error('child process closed (interally) with code ' + code, {port: port});
		  	} else {
		  		logger.error('child process closed (externally) with code ' + code, {port: port});
		  		eventBus.emit('appKilled', port, appLocation, logFile, code);
		  	}
		});

		return app;
	}

	/**
		Look for apps getting killed and restart them

	*/
	eventBus.on('appKilled', function(port, appLocation, logFile, code) {
		
		logger.info('spawning an app due to kill', {port: port, appLocation: appLocation});
		var app = spawnAnApp(port, appLocation, logFile);
		workers[port] = app;
	});
}