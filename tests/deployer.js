var horaa = require('horaa');
var child_process = horaa('child_process');
var EventEmitter = require('events').EventEmitter;
var deployer = require('deployer');
var nodemock = require('nodemock');
var fs = require('fs');

exports.testDeployGitError = function(test) {

	test.expect(2);

	var events = new EventEmitter();
	
	child_process.hijack('exec', function(cmd, options, callback) {
		test.equal('gitpath', options.cwd);
		callback({}); //sending error
	});

	var d = deployer.load('gitpath', null, events);
	d.deploy(4345, '/tmp/aa.log', function(err) {
		test.ok(err);
		test.done();
	});
};

exports.testDirCreatedError = function(test) {

	test.expect(3);

	var events = new EventEmitter();
	var port = 4555;
	var apppath = "/apps";
	var gitpath = "/gitpath";
	var appLocation = apppath + '/' + port;
	var cnt = 0;
	child_process.hijack('exec', function(cmd, options, callback) {
		
		if(cnt++ == 0) {
			test.equal(gitpath, options.cwd);
			callback(); //sending success
		} else {
			test.equal('rm -rf ' + appLocation + ' && mkdir -p ' + appLocation, cmd);
			options({}); //sending error
		}
	});

	var d = deployer.load(gitpath, apppath, events);
	d.deploy(port, '/tmp/aa.log', function(err) {
		test.ok(err);
		test.done();
	});
};

exports.testDirCopyError = function(test) {

	test.expect(4);

	var events = new EventEmitter();
	var port = 4555;
	var apppath = "/apps";
	var gitpath = "/gitpath";
	var appLocation = apppath + '/' + port;
	var cnt = 0;
	child_process.hijack('exec', function(cmd, options, callback) {
		
		if(cnt == 0) {
			cnt ++;
			test.equal(gitpath, options.cwd);
			callback(); //sending success
		} else if(cnt == 1) {
			cnt ++;
			test.equal('rm -rf ' + appLocation + ' && mkdir -p ' + appLocation, cmd);
			options(); //sending success
		} else {
			cnt ++;
			test.equal('cp ' + gitpath + '/* ' + appLocation + ' -r', cmd);
			options({}); //sending error
		}
	});

	var d = deployer.load(gitpath, apppath, events);
	d.deploy(port, '/tmp/aa.log', function(err) {
		test.ok(err);
		test.done();
	});
};

exports.testNpmInstallError = function(test) {

	test.expect(8);

	var events = new EventEmitter();
	var port = 4555;
	var apppath = "/apps";
	var gitpath = "/gitpath";
	var appLocation = apppath + '/' + port;
	var cnt = 0;
	child_process.hijack('exec', function(cmd, options, callback) {
		
		if(cnt == 0) {
			cnt ++;
			test.equal(gitpath, options.cwd);
			callback(); //sending success
		} else if(cnt == 1) {
			cnt ++;
			test.equal('rm -rf ' + appLocation + ' && mkdir -p ' + appLocation, cmd);
			options(); //sending success
		} else if(cnt == 2){
			cnt ++;
			test.equal('cp ' + gitpath + '/* ' + appLocation + ' -r', cmd);
			options();
		} else if(cnt ==3) {
			cnt++;
			test.equal('./init.sh',cmd);
			test.equal(appLocation,options.cwd);
			callback({}); //sending error
		} else {
			cnt++;
			test.equal('npm install',cmd);
			test.equal(appLocation,options.cwd)
			callback({}); 
		}
	});

	var d = deployer.load(gitpath, apppath, events);
	d.deploy(port, '/tmp/aa.log', function(err) {
		test.ok(err);
		test.done();
	});
};

exports.testNpmDeploySuccess = function(test) {

	test.expect(4);

	var events = new EventEmitter();
	var port = 4555;
	var apppath = "/apps";
	var gitpath = "/gitpath";
	var appLocation = apppath + '/' + port;
	var cnt = 0;
	child_process.hijack('exec', function(cmd, options, callback) {
		
		if(callback) {
			callback();
		} else {
			options();
		}
	});

	var app = nodemock.ignore('foo');
	app.mock('on').takes('exit', function() {});
	var stdout = nodemock.mock('on').takes('data', function() {});
	var stderr = nodemock.mock('on').takes('data', function() {});
	app.stdout = stdout;
	app.stderr = stderr;
	child_process.hijack('spawn', function(cmd, options, config) {
		
		test.equal(cmd, 'node');
		test.deepEqual(options, ['start.js', port]);
		test.equal(appLocation, config.cwd);

		return app;
	});

	var d = deployer.load(gitpath, apppath, events);
	d.deploy(port, '/tmp/aa3.log', function(err) {
		test.ok(!err);
		test.done();
	});
};

exports.testNpmDeployTwice = function(test) {

	test.expect(8);

	var events = new EventEmitter();
	var port = 4555;
	var apppath = "/apps";
	var gitpath = "/gitpath";
	var appLocation = apppath + '/' + port;
	var cnt = 0;
	child_process.hijack('exec', function(cmd, options, callback) {
		
		if(callback) {
			callback();
		} else {
			options();
		}
	});

	var app = nodemock.ignore('foo');
	var ctrlAppKill = {};
	app.mock('on').takes('exit', function() {}).ctrl(1, ctrlAppKill).times(2);
	app.mock('kill').takes('SIGQUIT');
	var stdout = nodemock.mock('on').takes('data', function() {}).times(2);
	var stderr = nodemock.mock('on').takes('data', function() {}).times(2);
	app.stdout = stdout;
	app.stderr = stderr;
	child_process.hijack('spawn', function(cmd, options, config) {
		
		test.equal(cmd, 'node');
		test.deepEqual(options, ['start.js', port]);
		test.equal(appLocation, config.cwd);

		return app;
	});

	var d = deployer.load(gitpath, apppath, events);

	events.on('appKilled', function() {
		test.fail();
	});

	d.deploy(port, '/tmp/aa3.log', function(err) {
		test.ok(!err);
		d.deploy(port, '/tmp/aa4.log', function(err) {
			test.ok(!err);
			ctrlAppKill.trigger(null);
			test.done();
		});
	});
};

exports.testAppForceKill= function(test) {

	test.expect(8);

	var events = new EventEmitter();
	var port = 4555;
	var apppath = "/apps";
	var gitpath = "/gitpath";
	var appLocation = apppath + '/' + port;
	var cnt = 0;
	child_process.hijack('exec', function(cmd, options, callback) {
		
		if(callback) {
			callback();
		} else {
			options();
		}
	});

	var app = nodemock.ignore('foo');
	var ctrlAppKill = {};
	app.mock('on').takes('exit', function() {}).ctrl(1, ctrlAppKill).times(2);
	app.mock('kill').takes('SIGQUIT');
	var stdout = nodemock.mock('on').takes('data', function() {}).times(2);
	var stderr = nodemock.mock('on').takes('data', function() {}).times(2);
	app.stdout = stdout;
	app.stderr = stderr;
	child_process.hijack('spawn', function(cmd, options, config) {
		
		test.equal(cmd, 'node');
		test.deepEqual(options, ['start.js', port]);
		test.equal(appLocation, config.cwd);

		return app;
	});

	var d = deployer.load(gitpath, apppath, events);

	events.on('appKilled', function(port_) {
		test.equal(port, port_);
		test.done();
	});

	d.deploy(port, '/tmp/aa3.log', function(err) {
		test.ok(!err);
		ctrlAppKill.trigger(1);
	});
};

exports.testAddWorkerTwice= function(test) {

	test.expect(9);

	var events = new EventEmitter();
	var port = 4555;
	var apppath = "/apps";
	var gitpath = "/gitpath";
	var appLocation = apppath + '/' + port;
	var cnt = 0;
	child_process.hijack('exec', function(cmd, options, callback) {
		
		if(callback) {
			callback();
		} else {
			options();
		}
	});

	var app = nodemock.ignore('foo');
	var ctrlAppKill = {};
	app.mock('on').takes('exit', function() {}).ctrl(1, ctrlAppKill).times(2);
	var stdout = nodemock.mock('on').takes('data', function() {}).times(2);
	var stderr = nodemock.mock('on').takes('data', function() {}).times(2);
	app.stdout = stdout;
	app.stderr = stderr;
	child_process.hijack('spawn', function(cmd, options, config) {
		
		test.equal(cmd, 'node');
		// test.deepEqual(options, ['start.js', port]);
		test.equal(appLocation, config.cwd);

		return app;
	});

	var d = deployer.load(gitpath, apppath, events);

	events.on('appKilled', function(port_) {
		test.fail();
	});

	d.deploy(port, '/tmp/aa3.log', function(err) {
		test.ok(!err);
		d.addWorker(8090, '/tmp/aa5.log', function(err) {
			test.ok(!err);
			test.ok(app.assert());
			test.ok(stdout.assert());
			test.ok(stderr.assert());
			test.done();
		});
	});
};

exports.testAddWorker= function(test) {

	test.expect(12);

	var events = new EventEmitter();
	var port = 4555;
	var apppath = "/apps";
	var gitpath = "/gitpath";
	var appLocation = apppath + '/' + port;
	var cnt = 0;
	child_process.hijack('exec', function(cmd, options, callback) {
		
		if(callback) {
			callback();
		} else {
			options();
		}
	});

	var app = nodemock.ignore('foo');
	var ctrlAppKill = {};
	app.mock('on').takes('exit', function() {}).ctrl(1, ctrlAppKill).times(3);
	app.mock('kill').takes('SIGQUIT');
	var stdout = nodemock.mock('on').takes('data', function() {}).times(3);
	var stderr = nodemock.mock('on').takes('data', function() {}).times(3);
	app.stdout = stdout;
	app.stderr = stderr;
	child_process.hijack('spawn', function(cmd, options, config) {
		
		test.equal(cmd, 'node');
		// test.deepEqual(options, ['start.js', port]);
		test.equal(appLocation, config.cwd);

		return app;
	});

	var d = deployer.load(gitpath, apppath, events);

	events.on('appKilled', function(port_) {
		test.fail();
	});

	d.deploy(port, '/tmp/aa3.log', function(err) {
		test.ok(!err);
		d.addWorker(8090, '/tmp/aa5.log', function(err) {
			test.ok(!err);
			
			d.addWorker(8090, '/tmp/aa5.log', function(err) {
				test.ok(!err);
				test.ok(app.assert());
				test.ok(stdout.assert());
				test.ok(stderr.assert());
				test.done();
			});
		});
	});
};

exports.testAddWorkerWithoutMaster= function(test) {

	test.expect(1);

	var events = new EventEmitter();
	var port = 4555;
	var apppath = "/apps";
	var gitpath = "/gitpath";
	var appLocation = apppath + '/' + port;
	var cnt = 0;
	child_process.hijack('exec', function(cmd, options, callback) {
		
		if(callback) {
			callback();
		} else {
			options();
		}
	});

	var d = deployer.load(gitpath, apppath, events);

	events.on('appKilled', function(port_) {
		test.fail();
	});

	d.addWorker(port, '/tmp/aa3.log', function(err) {
		test.ok(err);
		test.done();
	});
};

exports.testNpmDeployLogCheck = function(test) {

	test.expect(5);

	var events = new EventEmitter();
	var port = 4555;
	var apppath = "/apps";
	var gitpath = "/gitpath";
	var appLocation = apppath + '/' + port;
	var cnt = 0;
	child_process.hijack('exec', function(cmd, options, callback) {
		
		if(callback) {
			callback();
		} else {
			options();
		}
	});

	var app = nodemock.ignore('foo');
	app.mock('on').takes('exit', function() {});
	var stdout = nodemock.mock('on').takes('data', function() {}).calls(1, ['out\n']);
	var stderr = nodemock.mock('on').takes('data', function() {}).calls(1, ['err\n']);
	app.stdout = stdout;
	app.stderr = stderr;
	child_process.hijack('spawn', function(cmd, options, config) {
		
		test.equal(cmd, 'node');
		test.deepEqual(options, ['start.js', port]);
		test.equal(appLocation, config.cwd);

		return app;
	});

	var d = deployer.load(gitpath, apppath, events);
	d.deploy(port, '/tmp/amp.log', function(err) {
		test.ok(!err);
		var logoutput = fs.readFileSync('/tmp/amp.log', 'utf8');
		test.equal(logoutput, 'out\nerr\n');

		fs.unlinkSync('/tmp/amp.log');
		test.done();
	});
};