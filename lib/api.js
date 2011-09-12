var path = require('path');
var dgram = require("dgram");
var logger = require('winstoon').createLogger('api');
var qbox = require('qbox');
var mkdirp = require('mkdirp')

/**
	Main API Which controlls main functionalities

	@param balancerPort - where the load balancer should starts
	@param gitpath - where the git repo exists
	@eventBus - Systemwide EventEmitter
*/
exports.load = function(workerPorts, gitpath, eventBus) {
	return new Api(workerPorts, gitpath, eventBus);
};

function Api(workerPorts, gitpath, eventBus) {

	var appName = gitpath.replace(/\//g, '_');

	var appaspath = path.normalize(process.env.HOME + '/.nariya/' + appName + '/apps');
	var logpath  = path.normalize(process.env.HOME + '/.nariya/' + appName + '/logs');

	var paths = qbox.create(['apps', 'logs']);
	mkdirp(appaspath, 0755, function() {paths.tick('apps')});
	mkdirp(logpath, 0755, function() {paths.tick('logs')});

	var deployer = require('./deployer').load(gitpath, appaspath, eventBus);

	var pids = {};

	/**
		Deploy the Current App and Put it to the load balancer
		This is the Qbox wrapped version for execute after the all the neccesory paths has been created
	*/
	this.deploy = function(callback) {
		paths.ready(function() {
			deployNow(callback);
		});
	}
	
	/**
		Deploy the Current App and Put it to the load balancer
	*/
	function deployNow(callback) {

		if(workerPorts.length > 0) {
			
			var logfile = path.resolve(logpath, workerPorts[0] + '.log');
			deployer.deploy(workerPorts[0], logfile, afterDeployed);

		} else {

			logger.error('empty worker ports');
			callback({message: 'empty worker ports'});
		}

		function afterDeployed(err, pid) {
			
			if(!err) {
				//start addtional workers reflecting to the given ports
				startWorkers();
			} else {
				logger.error('error when deploying the app', {port: workerPorts[0]});
				callback(err);
			}
		}

		function startWorkers() {
			
			var workersToAdd = [];
			for(var lc = 1; lc<workerPorts.length; lc++) {
				workersToAdd.push(workerPorts[lc]);
			}

			var workers = qbox.create(workersToAdd); // flow controll
			var errorStack = [];
			workersToAdd.forEach(function(port) {
				
				var logfile = path.resolve(logpath, port + '.log');
				deployer.addWorker(port, logfile, function(err, pid) {
					workers.tick(port); //flow control
					if(err) {
						errorStack.push(err);
						logger.error('error when starting the worker', {port: port});
					}					
				})
			});

			workers.ready(function() {
				
				if(errorStack.length == 0) {
					//no error
					callback();
				} else {
					callback(errorStack);
				}
			});
		}
		
	}

}