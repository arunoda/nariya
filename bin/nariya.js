#!/usr/bin/env node
var path = require('path');
require('colors');
var mkdirp = require('mkdirp');
var Deployer = require('../lib/deployer');
var deployer = new Deployer();
var exec = require('child_process').exec;
var ConfigurationManager = require('../lib/configurationManager');
var crypto = require('crypto');
var cjson = require('cjson');
var fs = require('fs');
var rest = require('restler');

var nariyaHome = path.resolve(process.env.HOME, '.nariya/');
var nariyaConfFile = path.resolve(nariyaHome, 'nariya.conf');
var nariyaLibs = path.resolve(__dirname, '../lib');
var nariyaLog = path.resolve(nariyaHome, './nariya.log');	
var nariyaErrorLog = path.resolve(nariyaHome, './nariya.err.log');	


var action = process.argv[2];

console.log('Welcome to Nariya - Continious Deployment Server'.bold.magenta);

if(action == 'start') {
	//start the server via forever

	startNariya();

} else if(action == 'stop') {
	
	//stop the server via forever

	var configurationManager = new ConfigurationManager(nariyaConfFile);
	configurationManager.updateSync();

	var stopCommand = 'forever stop start-nariya.js';
	exec(stopCommand, { cwd: nariyaLibs }, function(err) {
		
		if(!err) {
			console.log('+ Nariya Server Stopped on port: %s'.bold.green, configurationManager.getServerInfo().port);
		} else {
			console.error('+ Error when stopping Nariya Server\n\t%s'.red,err.message);
		}

	});
} else if(action ==  'add') {

	var configurationManager = new ConfigurationManager(nariyaConfFile);

	//add an repository to nariya
	var name = process.argv[3];
	if(name) {
		
		//check for configured nariya
		deployer.fileExists(nariyaConfFile, function(exists) {
			if(exists) {
				configurationManager.updateSync();
				checkForGit(process.cwd(), afterGitChecked);
			} else {
				console.log('+ Nariya is not configured. start the nariya'.bold.red);
				console.log('\teg:- nariya start');
			}
		});
		
	} else {
		console.log('+ Project Name Required:'.bold.red);
		console.log('\teg:- nariya add project-name');
	}

	function afterGitChecked(yes) {
		
		if(yes) {
	
			deployer.findStartScript(process.cwd(), startScriptFounded);

		} else {
			console.error('+ This is not an valid git project'.bold.red);
		}
	}

	function startScriptFounded(err, script) {
		
		if(!err) {
			var repoInfo = {
				location: process.cwd(),
				logpath: path.resolve(nariyaHome, './' + name),
				type: 'github',
				secret: md5('' + Math.random()),
				branch: 'master',
				startScript: script
			}
			//create the log path
			mkdirp(repoInfo.logpath, 0755);
			saveConfigurations(name, repoInfo);

			var webhook = 'http://hostname:' + configurationManager.getServerInfo().port + '/deploy/' + repoInfo.secret;
			console.log('+ project added with secret: %s'.bold.green, repoInfo.secret.yellow);
			console.log('  add following webhook\n\t' + webhook);
			console.log('  edit %s for advanced configurations', nariyaConfFile.bold);
			console.log('+ starting nariya again to apply these settings'.bold.green);
			startNariya();

		} else {
			console.error('+ Error loading Startup Script: %s'.bold.red, err.message);
		}
	}

} else if(action == 'deploy') {
	
	var name = process.argv[3];
	if(name) {

		var conf = cjson.load(nariyaConfFile);
		var repo = conf.repositories[name];
		if(repo) {
		
			var uri = 'http://localhost:' + conf.server.port + '/deploy/' + repo.secret;
			console.log('+ simulating github webhook call as'.bold.green);
			console.log('\t' + uri);

			rest.post(uri, {
				data: {
					payload: '{"ref": "refs/heads/master"}'
				}
			}).on('complete', function() {
				console.log('+ Project Deployment started'.green.bold);
			}).on('error', function(err) {
				console.error('+ Error Deploying Request'.bold.red);
				console.error('\t' + err.message);
			});

		} else {
			console.log('This is not a valid nariya enabled project'.red.bold);
		}
		
	} else {
		console.log('+ Project Name Required:'.bold.red);
		console.log('\teg:- nariya add project-name');
	}

} else {
	console.log('	usage: nariya [start | stop | add | deploy ]'.bold.green);
	console.log('\n');
}

function checkForGit(folder, callback) {
	
	exec('git status', {cwd: folder}, function(err, stdout, stderr) {
		
		if(!err) {
			callback(true);
		} else {
			callback(false);
		}
	});
}

function md5(data) {
	var hash = crypto.createHash('md5');
	hash.update(data);
	return hash.digest('hex');
}

function saveConfigurations(appname, repoInfo) {
	
	var conf = cjson.load(nariyaConfFile);
	conf.repositories[appname] = repoInfo;
	fs.writeFileSync(nariyaConfFile, JSON.stringify(conf, null, 4), 'utf-8');
}

function startNariya() {
	
	mkdirp(nariyaHome, 0755, function() {
		var sampleConf = path.resolve(__dirname, '../conf/sample.conf');
		deployer.executeIfNotExists(nariyaHome, 'nariya.conf', 'cp ' +  sampleConf + ' ' + nariyaConfFile, afterCopied);
	});

	function afterCopied(err) {

		var configurationManager = new ConfigurationManager(nariyaConfFile);
		configurationManager.updateSync();

		var startCommand = 'forever stop start-nariya.js && SL_NAME=nariya NODE_ENV=production forever start ';
		startCommand += '-o ' + nariyaLog + ' ';
		startCommand += '-e ' + nariyaErrorLog + ' ';
		startCommand += 'start-nariya.js';

		exec(startCommand, { cwd: nariyaLibs }, function(err) {
			
			if(!err) {
				console.log('+ Nariya Server Started on port: %s'.bold.green, configurationManager.getServerInfo().port);
			} else {
				console.error('+ Error when starting Nariya Server\n\t%s'.red,err.message);
			}
		});
	};
}