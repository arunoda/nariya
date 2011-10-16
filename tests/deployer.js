var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
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


exports.testFindStartScript = function(test) {
	
	var deployer = new Deployer();
	var projectFolder = '/tmp/aaaaa';
	mkdirp(projectFolder, 0755, function() {
		fs.writeFileSync(path.resolve(projectFolder, './start-hello.js'), 'data', 'utf8');
		fs.writeFileSync(path.resolve(projectFolder, './aa-hello.js'), 'data', 'utf8');
		deployer.findStartScript(projectFolder, function(err, file) {

			test.ok(!err);
			test.equal(file, 'start-hello.js');

			fs.unlinkSync(path.resolve(projectFolder, './start-hello.js'));
			fs.unlinkSync(path.resolve(projectFolder, './aa-hello.js'));
			test.done();
		});
	});
};

/**
	USE WITH CARE - HIGHLY SYSTEM Dependant
*/
// exports.testDeploy = function(test) {
	
// 	var winstoon = require('winstoon');
// 	winstoon.add(winstoon.transports.Console,  {colorize: true});
// 	var deployer = new Deployer();
// 	var repoInfo = {
// 		logpath: '/tmp',
// 		location: '/edu/projects/kodeincloud/multiuser-sms-simulator',
// 		name: 'sms-simulator',
// 		startScript: 'start-app.js'
// 	};
// 	deployer.deploy(repoInfo, function(err) {
		
// 		console.log(err);
// 		test.ok(!err)
// 		test.done();
// 	});

// };

