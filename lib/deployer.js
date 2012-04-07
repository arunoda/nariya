/**

	Deployer 
	========

	check for NO_DEPLOY file
	npm install
	Execute `pre.sh`
	Execute `start.js`
	Execute	`post.sh`

*/

var fs = require('fs');
var winstoon = require('winstoon');
var logger = winstoon.createLogger('deployer');
var exec = require('child_process').exec;
var path = require('path');

module.exports = Deployer;

function Deployer() {
	
	var self = this;

	/**
		Deploy the app in the location
		return as an callback
			function(error, deployed: boolean)
				deployed would get false if NO_DEPLOY file exists without an error
	*/
	this.deploy = function(repoInfo, callback) {

		var appname = repoInfo.name;
		var location = repoInfo.location;
		var logpath = repoInfo.logpath;
		var startScript = repoInfo.startScript;
		
		logger.info('deploying app', {location: location, appname: appname});

		//check for NO_DEPLOY file
		var noDeployFilePath = path.resolve(location, 'NO_DEPLOY');
		logger.info('checking for NO_DEPLOY');
		self.fileExists(noDeployFilePath, function(exists) {
			
			if(exists) {
				logger.info('NO_DEPLOY exists, so abort');
				callback(null, false);
			} else {
				//npm install
				logger.info('executing npm install');
				self.executeIfExists(location, 'package.json', 'npm install', afterNpmInstalled);
			}
		});

		function afterNpmInstalled(error, executed) {
			
			if(!error) {
				//execute pre.sh
				logger.info('executing pre.sh');
				self.executeIfExists(location, 'pre.sh', 'sh pre.sh', afterPreShExecuted);
			} else {
				
				logger.error('error on npm install', {error: error});
				callback(wrapError('NPM_INSTALL_ERROR', error));
			}
		}

		function afterPreShExecuted(error, executed) {
			
			if(!startScript) {
				//if there is no start script we bypass the execution of it.
				logger.info("bypassing starting apps - node startScript", {appname: appname});
				afterAppStarted(null, false);

			} else if (!error) {
				//starting the application (start.js)
				logger.info('starting the application with start.js');

				var outLogs = path.resolve(logpath, appname + '.log');
				var errLogs = path.resolve(logpath, appname + '.err.log');
				var appStartCommad = 'forever stop ' + startScript + ' && SL_NAME=' + appname + ' forever start -a -o ' + outLogs + ' -e ' + errLogs + ' ' + startScript;

				self.executeIfExists(location, startScript, appStartCommad, afterAppStarted);
			} else {
				
				logger.error('error on executing pre.sh', {error: error});
				callback(wrapError('PRE_SH_ERROR', error));
			}
		}

		function afterAppStarted(error, executed) {
			
			if(!error) {
				//nexecuting `post.sh`
				logger.info('executing post.sh');
				self.executeIfExists(location, 'post.sh', 'sh post.sh', afterPostShExecuted);
			} else {
				
				logger.error('error on starting the app', {error: error});
				callback(wrapError('APP_START_ERROR', error));
			}
		}

		function afterPostShExecuted(error, executed) {
			
			if(!error) {
				//total deployment succeded
				logger.info('deployment completed', {appname: appname, location: location});
				callback();
			} else {
				
				logger.error('error on executing post.sh', {error: error});
				callback(wrapError('POST_SH_ERROR', error));
			}
		}

	};

	function wrapError(id, error) {
		return {
			code: id,
			message: error.message
		};
	}

	/**
		Execute the given @command if @file exists
		all these actions happens at the directory declared on @cwd
		return as an callback
			function(error, executed:boolean);
	*/
	this.executeIfExists = function executeIfExists(cwd, file, command, callback) {
		
		var filepath = path.resolve(cwd, file);
		self.fileExists(filepath, function(exists) {
			
			if(exists) {
				logger.debug('executing command', {command: command});
				exec(command, { cwd: cwd }, afterExecuted);
			} else {
				//let the use knows via a callback
				logger.debug('file not exits - abort command', {file: file, command: command});
				callback(null, false);
			}
		});		

		function afterExecuted(err, stdout, stderr) {
			
			if(err) {
				callback(err, false);
			} else {
				callback(null, true);
			}
		}
	}

	/**
		Execute the given @command if @file not exists
		all these actions happens at the directory declared on @cwd
		return as an callback
			function(error, executed:boolean);
	*/
	this.executeIfNotExists = function executeIfExists(cwd, file, command, callback) {
		
		var filepath = path.resolve(cwd, file);
		self.fileExists(filepath, function(exists) {
			
			if(!exists) {
				logger.debug('executing command', {command: command});
				exec(command, { cwd: cwd }, afterExecuted);
			} else {
				//let the use knows via a callback
				logger.debug('file not exits - abort command', {file: file, command: command});
				callback(null, false);
			}
		});		

		function afterExecuted(err, stdout, stderr) {
			
			if(err) {
				callback(err, false);
			} else {
				callback(null, true);
			}
		}
	}

	/*
		check whether a given file is exists or not
		return as an callback
			function(boolean);
	*/
	this.fileExists = function fileExists(filepath, callback) {
		
		fs.lstat(filepath, function(err, fileInfo) {
			
			if(!err) {
				callback(true);	
			} else {
				callback(false);
			}
		});
	}

	/**
		Find the valid startScript to start with node
		it should match /^start.*\.js$/
	*/
	this.findStartScript =  function(location, callback) {
		
		fs.readdir(location, function(err, files) {
			
			if(!err) {
				
				for(var index in files) {
					var file = files[index];
					if(file.match(/^start.*\.js$/)) {
						return callback(null, file);
					}
				}
				//if no one selected
				return callback();

			} else {
				callback(err);
			}
		});
	};
}