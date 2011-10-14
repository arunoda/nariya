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

	Events Available
	----------------

	* notify.masterDeployed - port
	* notify.error.materDeploy - port, error
	* notify.startWorkersDeployment - port
	* notify.workerDeployed - port
	* notify.error.workerDeploy - port. error
	* notify.deployed
	* notify.error.deployed - error
*/
exports.load = function(appName, workerPorts, gitpath, eventBus) {
	return new Api(appName, workerPorts, gitpath, eventBus);
};

function Api(appName, workerPorts, gitpath, eventBus) {

	var appaspath = path.normalize(process.env.HOME + '/.nariya/' + appName + '/apps');
	var logpath  = path.normalize(process.env.HOME + '/.nariya/' + appName + '/logs');

	var paths = qbox.create(['apps', 'logs']);
	mkdirp(appaspath, 0755, function() {paths.tick('apps')});
	mkdirp(logpath, 0755, function() {paths.tick('logs')});

	var deployer = require('./deployer').load(gitpath, appaspath, eventBus);

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

		eventBus.emit('notify.startDeploy');

		var logfile = path.resolve(logpath, workerPorts[0] + '.log');
		deployer.deploy(workerPorts[0], logfile, afterDeployed);

		function afterDeployed(err, pid) {
			
			if(!err) {
				//start addtional workers reflecting to the given ports
				eventBus.emit('notify.masterDeployed', workerPorts[0]);
				startWorkers();
			} else {
				eventBus.emit('notify.error.materDeploy', workerPorts[0], err);
				logger.error('error when deploying the app', {port: workerPorts[0]});
				if(callback) callback(err);
			}
		}

		function startWorkers() {
			
			var workersToAdd = [];
			for(var lc = 1; lc<workerPorts.length; lc++) {
				workersToAdd.push(workerPorts[lc]);
			}

			eventBus.emit('notify.startWorkersDeployment', workersToAdd);
			var workers = qbox.create(workersToAdd); // flow controll
			// start the qbox if there is no worker to add
			if(workersToAdd.length == 0) workers.start(); 
			var errorStack = [];
			workersToAdd.forEach(function(port) {
				
				var logfile = path.resolve(logpath, port + '.log');
				deployer.addWorker(port, logfile, function(err, pid) {
					workers.tick(port); //flow control
					if(err) {
						errorStack.push(err);
						logger.error('error when starting the worker', {port: port});
						eventBus.emit('notify.error.workerDeploy', port, err);
					} else {
						eventBus.emit('notify.workerDeployed', port);
					}				
				})
			});

			workers.ready(function() {
				
				if(errorStack.length == 0) {
					//no error
					
					eventBus.emit('notify.deployed');
					if(callback) callback();
				} else {
					eventBus.emit('notify.error.deployed', errorStack);
					if(callback) callback(errorStack);
				}
			});
		}
		
	}

}