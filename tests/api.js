var api = require('api');
var EventEmitter = require('events').EventEmitter;
var horaa = require('horaa');
var path = require('path');
var nodemock = require('nodemock');

exports.testDeployFailed = function(test) {
	
	var appName = 'testApi';
	var workerPorts = [9090, 4040]
	var gitpath = '/tmp/test';
	var eventBus = new EventEmitter();
	var deployer = horaa('deployer');


	var logfile = path.normalize(process.env.HOME + '/.nariya/' + appName + '/logs/' + appName + '.log');
	var d = nodemock.mock('deploy').takes(workerPorts[0], logfile, function() {}).calls(2, [{}]);
	deployer.hijack('load', function(git, apps, ev) {
		test.equal(git, gitpath);
		test.equal(apps, path.normalize(process.env.HOME + '/.nariya/' + appName +'/apps'));
		return d;
	});

	var a = api.load(appName, workerPorts, gitpath, eventBus);	
	a.deploy(function(err) {
		test.ok(err);
		test.done();
	});
};
