var path = require('path');
var dgram = require("dgram");
var logger = require('winstoon').createLogger('api');
var qbox = require('qbox');

/**
	Main API Which controlls main functionalities

	@param balancerPort - where the load balancer should starts
	@param gitpath - where the git repo exists
	@eventBus - Systemwide EventEmitter
*/
exports.load = function(balancerPort, gitpath, eventBus) {
	return new Api(balancerPort, gitpath, eventBus);
};

function Api(balancerPort, gitpath, eventBus) {

	var appaspath = path.normalize(process.env.HOME + '/.nariya/' + balancerPort + '/apps');
	var logpath  = path.normalize(process.env.HOME + '/.nariya/' + balancerPort + '/logs');

	var balancer = require('./loadBalancer').load(balancerPort, eventBus);
	var deployer = require('./deployer').load(gitpath, appaspath, eventBus);

	var masterPort = null;
	var pids = {};

	//workers in the balancer
	//default to 1 
	//add to reflect no of cores you have
	var workers = 1; 
	
	/**
		Deploy the Current App and Put it to the load balancer
	*/
	this.deploy = function(callback) {
		
		//select the port, logpath
		var oldMasterPort = masterPort;
		masterPort = getFreePort();
		var logfile = path.resolve(logpath, masterPort + '.log');

		//deploy
		deployer.deploy(masterPort, logfile, function(err, pid) {
			
			if(!err) {
				//save the pid of current
				pids[masterPort] = pid;
				//add to the balancer
				balancer.setMaster('localhost', masterPort);
				//remove all other entries from balancer
				var slavePorts = balancer.removeSlaves('localhost');
				//kill their processes
				killProcesses(slavePorts);
				//add workers
				addWorkers(function(err) {
					
					if(!err) {
						callback();
					} else {
						logger.error('workers adding failed', {err: err});
						callback(err);
					}
				});

			} else {
				logger.error('error when deploying', {err: err, port: masterPort});
				callback(err);
			}
		});

		function killProcesses(slavePorts) {
			
			slavePorts.forEach(function(port) {
				var pid = pids[port];
				if(pid) {
					logger.info('killing the process(worker app)', {port: port, pid: pid});
					process.kill(pid);
				}
			});
		}

		function addWorkers(callback) {
			
			var additionalWorkers = workers -1;
			if(additionalWorkers > 0) {
				
				//errorss
				var errorStack = [];

				//getting ports
				var ports = [];
				for(var cnt = 0; cnt < additionalWorkers; cnt ++) {
					ports.push(getFreePort());
				}

				//flow controlling
				var $ = qbox.create(ports)
				ports.forEach(function(port) {

					var logfile = path.resolve(logpath, port + '.log');
					deployer.addWorker(port, logfile, function(err, pid) {
						
						if(!err) {
							//saving the pid
							pids[port] = pid;
							$.tick(port); //ticking the flow controllers
						} else {
							errorStack.push(err);
							logger.error('error when adding worker', {port: port});
						}
					});
				});

				//when all the deployment happens
				$.ready(function() {
					if(errorStack.length == 0) {
						callback();
					} else {
						callback(errorStack);
					}
				});
			}
		}
		//add workers of the new deployment to reflect the count

		//save their pids
	}
}

function getFreePort() {
	var server = dgram.createSocket("udp4");
	server.bind(0, "localhost");
	var port = server.address().port;
	server.close();
	
	return port;
}