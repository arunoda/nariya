var loadBalancer = require('loadBalancer');
var horaa = require('horaa');
var httpProxy = horaa('http-proxy');
var nodemock = require('nodemock');

exports.testAddEntry = function(test) {
	
	var balancer = loadBalancer.load(7070);
	balancer.addEntry('localhost', 9090);
	var ports = balancer.getPorts('localhost');
	test.deepEqual([9090], ports);
	balancer.close();	
	test.done();
};

exports.testRemoveEntry = function(test) {
	
	var balancer = loadBalancer.load(7071);
	balancer.addEntry('localhost', 9090);
	balancer.addEntry('localhost', 9091);
	balancer.removeEntry('localhost', 9091);

	var ports = balancer.getPorts('localhost');
	test.deepEqual([9090], ports);

	balancer.close();
	test.done();
};

exports.testRemoveEntryInvalidPort = function(test) {
	
	var balancer = loadBalancer.load(7072);
	balancer.addEntry('localhost', 9090);
	balancer.addEntry('localhost', 9091);
	balancer.removeEntry('localhost', 9092);

	var ports = balancer.getPorts('localhost');
	test.deepEqual([9090, 9091], ports);

	balancer.close();
	test.done();
};

exports.testRemoveEntryInvalidHost = function(test) {
	
	var balancer = loadBalancer.load(7073);
	balancer.addEntry('localhost', 9090);
	balancer.addEntry('localhost', 9091);
	balancer.removeEntry('localhostsss', 9091);

	var ports = balancer.getPorts('localhost');
	test.deepEqual([9090, 9091], ports);

	balancer.close();
	test.done();
};

exports.testMasterSlave = function(test) {
	
	var balancer = loadBalancer.load(7074);
	balancer.addEntry('localhost', 9090);
	balancer.addEntry('localhost', 9091);
	balancer.addEntry('localhost', 9092);
	balancer.addEntry('localhost', 9093);
	
	balancer.setMaster('localhost', 9090);
	var slavePorts = balancer.removeSlaves('localhost');
	test.deepEqual([9091, 9092, 9093], slavePorts);

	var ports = balancer.getPorts('localhost');
	test.deepEqual([9090], ports);

	balancer.close();
	test.done();
};

exports.testMasterSlave = function(test) {
	
	var balancer = loadBalancer.load(7074);

	balancer.addEntry('localhost', 9093);
	balancer.setMaster('localhost', 9090);
	var slavePorts = balancer.removeSlaves('localhost');
	test.deepEqual([9093], slavePorts);

	var ports = balancer.getPorts('localhost');
	test.deepEqual([9090], ports);

	balancer.close();
	test.done();
};

exports.testSlaveWithoutMaster = function(test) {
	
	var balancer = loadBalancer.load(7075);
	balancer.addEntry('localhost', 9090);
	balancer.addEntry('localhost', 9091);
	balancer.addEntry('localhost', 9092);
	balancer.addEntry('localhost', 9093);
	
	var slavePorts = balancer.removeSlaves('localhost');
	test.deepEqual([], slavePorts);

	var ports = balancer.getPorts('localhost');
	test.deepEqual([9090, 9091, 9092, 9093], ports);

	balancer.close();
	test.done();
};

exports.testBalance = function(test) {
	
	var proxy = nodemock.mock('proxyRequest').takes(null, null, {host: 'localhost', port: 9090}).times(2);
	proxy.mock('proxyRequest').takes(null, null, {host: 'localhost2', port: 9091});

	var app = nodemock.mock('listen').takes(7075);
	app.mock('close');

	var curl = null;
	httpProxy.hijack('createServer', function(callback) {
		curl = callback;
		return app;
	});

	var balancer = loadBalancer.load(7075);
	balancer.addEntry('localhost', 9090);
	balancer.addEntry('localhost2', 9091);

	curl(null, null, proxy);
	curl(null, null, proxy);
	curl(null, null, proxy);

	test.ok(proxy.assert());

	balancer.close();
	test.done();
};

exports.testBalanceOnlyWith = function(test) {
	
	var proxy = nodemock.mock('proxyRequest').takes(null, null, {host: 'localhost', port: 9090}).times(3);

	var app = nodemock.mock('listen').takes(7075);
	app.mock('close');

	var curl = null;
	httpProxy.hijack('createServer', function(callback) {
		curl = callback;
		return app;
	});

	var balancer = loadBalancer.load(7075);
	balancer.addEntry('localhost', 9090);
	balancer.addEntry('localhost2', 9091);

	balancer.balanceOnlyWith('localhost');

	curl(null, null, proxy);
	curl(null, null, proxy);
	curl(null, null, proxy);

	test.ok(proxy.assert());

	balancer.close();
	test.done();
};

exports.testBalanceAll = function(test) {
	
	var proxy = nodemock.mock('proxyRequest').takes(null, null, {host: 'localhost', port: 9090}).times(2);
	proxy.mock('proxyRequest').takes(null, null, {host: 'localhost2', port: 9091});

	var app = nodemock.mock('listen').takes(7075);
	app.mock('close');

	var curl = null;
	httpProxy.hijack('createServer', function(callback) {
		curl = callback;
		return app;
	});

	var balancer = loadBalancer.load(7075);
	balancer.addEntry('localhost', 9090);
	balancer.addEntry('localhost2', 9091);

	balancer.balanceOnlyWith('localhost');
	balancer.balanceAll();

	curl(null, null, proxy);
	curl(null, null, proxy);
	curl(null, null, proxy);

	test.ok(proxy.assert());

	balancer.close();
	test.done();
};

exports.testBalanceWithoutNoEntry = function(test) {

	var app = nodemock.mock('listen').takes(7075);
	app.mock('close');

	var curl = null;
	httpProxy.hijack('createServer', function(callback) {
		curl = callback;
		return app;
	});

	var balancer = loadBalancer.load(7075);

	var res = nodemock.mock('end');
	curl(null, res, null);

	test.ok(res.assert());

	balancer.close();
	test.done();
};
