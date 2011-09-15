var portParser = require('portParser');

exports.testOneWorkerSingle = function(test) {
	
	var ports = portParser('8090');
	test.deepEqual(ports, [[8090]]);
	test.done();
};

exports.testOneWorkerMultiple= function(test) {
	
	var ports = portParser('8090, 8091,8092');
	test.deepEqual(ports, [[8090, 8091, 8092]]);
	test.done();
};

exports.testOneWorkerError= function(test) {
	
	var ports = portParser('8090, dfd');
	test.deepEqual(ports, null);
	test.done();
};

exports.testOneWorkerSingleError = function(test) {
	
	var ports = portParser('dsd');
	test.deepEqual(ports, null);
	test.done();
};

exports.testTwoWorkerSingle = function(test) {
	
	var ports = portParser(['8090', '8091']);
	test.deepEqual(ports, [[8090], [8091]]);
	test.done();
};

exports.testTwoWorkerMultiple= function(test) {
	
	var ports = portParser(['8090, 8091,8092', '7091, 9091']);
	test.deepEqual(ports, [[8090, 8091, 8092], [7091, 9091]]);
	test.done();
};

exports.testTwoWorkerError= function(test) {
	
	var ports = portParser(['8090, 8091,8092', '7091, sdsd']);
	test.deepEqual(ports, null);
	test.done();
};
