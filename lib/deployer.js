var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var forever = require('forever');
var winstoon = require('winstoon');
var logger = winstoon.createLogger('deployer');
var fs = require('fs');
var qbox = require('qbox');

/**

	Deployer - Responsible for deploying the app retreived from the GIT

	@param gitpath - Path where GIT based project exists
	@param appspath - where apps goona deployed
	@param eventBus - eventEmitter
*/
exports.load = function(gitpath, appspath, eventBus) {
	return new Deployer(gitpath, appspath, eventBus);
}

function Deployer(gitpath, appspath, eventBus) {
	
	/**
		Deploy the app into the given port

		@param port - where app need to started
		@param logFile - where the logfile output should send
		@param callback - calls after the complete deployment
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
		// copyApp(); //+++++++____________

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

		var $ = qbox.create();
		var logFd = fs.openSync(logFile, 'a+');
		function afterNpmInstalled(err, output) {
			
			if(!err) {

				//spawn the app
				logger.info('invoking the app');
				var app = spawn('node', ['start.js', port], {cwd: appLocation});

				//emit about the app
				logger.info('app starting', {pid: app.pid});
				eventBus.emit('appStarted', app.pid);

				app.stdout.on('data', function (data) {
					fs.write(logFd, data.toString('utf8'));
				});

				app.stderr.on('data', function (data) {
					fs.write(logFd, data.toString('utf8'));
				});

				app.on('exit', function (code) {
				  logger.error('child process exited with code ' + code);
				});

				callback();
			
			} else {
				logger.error('failed npm install', {err: err, port: port});
				callback(err);
			}
		}

	};
}