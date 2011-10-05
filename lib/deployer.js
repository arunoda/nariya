var child_process = require('child_process');
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
	* workerKilled ports, appLocation, logFile, errorCode
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

		@param ports - array of ports where app need to started
		@param logFile - where the logfile output should send
		@param callback - calls after the complete deployment
			
			@param err - error object if exists
			@param pid - pid of the deployed app
			function(err, pid) {}
	*/
	this.deploy = function deploy(ports, logFile, callback) {
		
		var deployName = ports.join('-');
		var appLocation = appspath + '/' + deployName;

		//git pull
		logger.info('getting pit pull', {gitpath: gitpath, ports: ports});

		child_process.exec('git pull origin master', {cwd: gitpath}, function(err, output) {
			if(!err) {

				copyApp();
			} else {
				logger.error('Git pull execution error', {err: err, path: gitpath});
				callback(err);
			}
		});

		//copy the app
		function copyApp() {
			
			logger.info('creating new app directory', {dir: appLocation, ports: ports});
			child_process.exec('rm -rf ' + appLocation + ' && mkdir -p ' + appLocation, afterDirCreated);	
		}

		function afterDirCreated(err, output) {
			
			if(!err) {
				logger.info('copying git dir into the new app Location', {gitpath: gitpath, appspath: appspath});
				child_process.exec('cp ' + gitpath + '/* ' + appLocation + ' -r', afterCopied);
			} else {
				logger.error('error when creating the new app directory', {dir: appLocation, ports: ports});
				callback(err);
			}
		}

		//invoke the init.sh script
		function afterCopied(err, output) {
			
			if(!err) {
				logger.info('invoking the init.sh', {appLocation: appLocation});
				child_process.exec('./init.sh', {cwd: appLocation}, afterExecutedInitSh);
			} else {
				logger.error('copying the app has aborted', {err: err, ports: ports});
				callback(err);
			}
		}

		//invoke npm install
		function afterExecutedInitSh(err, output) {
		
			if(err) {
				logger.error('failed to execute init.sh', {err: err, ports: ports});
			} 

			logger.info('npm install', {appLocation: appLocation, ports: ports});
			child_process.exec('npm install', {cwd: appLocation}, afterNpmInstalled);
		};

		function afterNpmInstalled(err, output) {
			
			if(!err) {

				//kill the app if already created 
				if(workers[getDeployName(ports)]) {
					killingApp[getDeployName(ports)] = true; //mark the app is scheduled to be kill
					workers[getDeployName(ports)].kill('SIGQUIT');
				}

				//spawn the app
				logger.info('invoking the app', {ports: ports});
				var app = spawnAnApp(ports, appLocation, logFile);
		
				workers[getDeployName(ports)] = app;
				masterApp = {ports: ports, pid: app.pid, path: appLocation};

				callback(null, app.pid);
			
			} else {
				logger.error('failed npm install', {err: err, ports: ports});
				callback(err);
			}
		}

	};

	/**
		Add a worker to the currently deployed app

		@param ports - where app need to started
		@param logFile - where the logfile output should send
		@param callback - calls after the complete deployment
			
			@param err - error object if exists
			@param pid - pid of the deployed app
			function(err, pid) {}
	*/
	this.addWorker = function(ports, logFile, callback) {
		
		if(masterApp) {

			//kill the app if already created 
			if(workers[getDeployName(ports)]) {
				killingApp[getDeployName(ports)] = true; //mark the app is scheduled to be kill
				workers[getDeployName(ports)].kill('SIGQUIT');
			}
			
			var appLocation = masterApp.path;
			var logFd = fs.openSync(logFile, 'a+');
			var app = spawnAnApp(ports, appLocation, logFile);
	
			workers[getDeployName(ports)] = app;
			callback(null, app.pid);

		} else {
			logger.error('No app deployed yet');
			callback({message: 'No app deployed yet'});
		}
	};


	/**
		Spawn and app on a new process and return it
	*/
	function spawnAnApp(ports, appLocation, logFile) {
		
		var logFd = fs.openSync(logFile, 'a+');

		logger.info('invoking the app for worker', {ports: ports});
		var params = ['start.js'].concat(ports);
		var app = child_process.spawn('node', params, {cwd: appLocation});

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
		  	
		  	if(killingApp[getDeployName(ports)]) { // app is scheduled to kill
		  		delete killingApp[getDeployName(ports)];
		  		logger.error('child process closed (interally) with code ' + code, {ports: ports});
		  	} else {
		  		logger.error('child process closed (externally) with code ' + code, {ports: ports});
		  		eventBus.emit('workerKilled', ports, appLocation, logFile, code);
		  	}
		});

		return app;
	}

	/**
		Look for apps getting killed and restart them

	*/
	eventBus.on('workerKilled', function(ports, appLocation, logFile, code) {
		
		logger.info('spawning an app due to kill', {ports: ports, appLocation: appLocation});
		var app = spawnAnApp(ports, appLocation, logFile);
		workers[getDeployName(ports)] = app;
		eventBus.emit('workerRestored', ports);
	});

	function getDeployName(ports) {
		return ports.join('-');
	}
}