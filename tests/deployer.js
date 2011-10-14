var fs = require('fs');

var Deployer = require('deployer');

exports.testFileExistsYes = function(test) {
	
	var deployer = new Deployer();
	var filename = '/tmp/hoora.out';
	fs.writeFileSync(filename, 'data', 'utf8');
	deployer.fileExists(filename, function(exists) {
		test.ok(exists);
		test.done();
	});
};

exports.testFileExistsNo = function(test) {
	
	var deployer = new Deployer();
	var filename = '/tmp/hooraOpps.out';
	deployer.fileExists(filename, function(exists) {
		test.ok(!exists);
		test.done();
	});
};

exports.testExecuteIfExistsYes = function(test) {
	
	var deployer = new Deployer();
	var filename = '/tmp/hoora2.out';
	fs.writeFileSync(filename, 'data', 'utf8');
	deployer.executeIfExists('/tmp', 'hoora2.out', 'rm hoora2.out', function(err, executed) {
		test.ok(executed);
		test.ok(!err);

		//check wheather file exists or not
		test.throws(function() {
			var stat = fs.lstatSync(filename);
		});

		test.done();
	});
};

exports.testExecuteIfExistsNo = function(test) {
	
	var deployer = new Deployer();
	deployer.executeIfExists('/tmp', 'hoora3.out', 'touch hoora2.out', function(err, executed) {
		test.ok(!executed);
		test.ok(!err);

		//ensure that command is not executed
		test.throws(function() {
			var stat = fs.lstatSync('/tmp/hoora3.out');
		});
		test.done();
	});
};

exports.testExecuteIfExistsError = function(test) {
	
	var deployer = new Deployer();
	var filename = '/tmp/hoora4.out';
	fs.writeFileSync(filename, 'data', 'utf8');

	//execute an invalid command
	deployer.executeIfExists('/tmp', 'hoora4.out', 'dfdf dsfd', function(err, executed) {
		test.ok(!executed);
		test.ok(err);
		//delete the created file
		fs.unlinkSync(filename);
		test.done();
	});
};

