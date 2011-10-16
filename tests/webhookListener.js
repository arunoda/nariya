var WebhookListener = require('webhookListener');
var nodemock = require('nodemock');
var request = require('request');
var rest = require('restler');
var Notifiers = require('notifiers');

exports.testInvalidSecret = function(test) {
	
	var port = 4234;
	var secret = 'aadssd';
	var configurationManager = nodemock.mock('getRepositoryInfo').takes(secret).returns(null);
	configurationManager.mock('getUpdates').fail();

	var wl = new WebhookListener(configurationManager, null, null, new Notifiers());

	wl.listen(port, function() {
		
		request.post('http://localhost:' + port + '/deploy/' + secret, function() {
			
			wl.close();
			test.ok(configurationManager.assert());
			test.done();
		});
	});
};

exports.testNoType = function(test) {
	
	var port = 4234;
	var secret = 'aadssd';
	var repoInfo = {
		name: 'name',
		type: 'github',
		location: 'location',
		logpath: 'logpath',
		secret: secret
	};
	var configurationManager = nodemock.mock('getRepositoryInfo').takes(secret).returns(repoInfo);
	configurationManager.mock('getUpdates').fail();

	var repositories = {

	};

	var wl = new WebhookListener(configurationManager, repositories, null, new Notifiers());

	wl.listen(port, function() {
		
		rest.post('http://localhost:' + port + '/deploy/' + secret, {
			
		}).on('complete', function() {
			
			wl.close();
			test.ok(configurationManager.assert());
			test.done();
		});
	});
};

exports.testAllowToDeployFalse = function(test) {
	
	var port = 4234;
	var secret = 'aadssd';
	var repoInfo = {
		name: 'name',
		type: 'github',
		location: 'location',
		logpath: 'logpath',
		secret: secret
	};
	var configurationManager = nodemock.mock('getRepositoryInfo').takes(secret).returns(repoInfo);
	configurationManager.mock('getUpdates').fail();

	var github = nodemock.mock('checkForDeploy').takes(repoInfo, '{"ref": "aa/aa/master"}').returns(false);
	var repositories = {
		"github": github
	};

	var wl = new WebhookListener(configurationManager, repositories, null, new Notifiers());

	wl.listen(port, function() {
		
		rest.post('http://localhost:' + port + '/deploy/' + secret, {
			data: '{"ref": "aa/aa/master"}',
			headers: {"Content-Type": "application/json"}
		}).on('complete', function() {
			
			wl.close();
			test.ok(configurationManager.assert());
			test.done();
		});
	});
};

exports.testGetUpdatesError = function(test) {
	
	var port = 4234;
	var secret = 'aadssd';
	var repoInfo = {
		name: 'name',
		type: 'github',
		location: 'location',
		logpath: 'logpath',
		secret: secret
	};
	var configurationManager = nodemock.mock('getRepositoryInfo').takes(secret).returns(repoInfo);
	var github = nodemock.mock('checkForDeploy').takes(repoInfo, '{"ref": "aa/aa/master"}').returns(true);
	github.mock('getUpdates').takes(repoInfo, function() {}).calls(1, [{}]);

	var repositories = {
		"github": github
	};

	var wl = new WebhookListener(configurationManager, repositories, null, new Notifiers());

	wl.listen(port, function() {
		
		rest.post('http://localhost:' + port + '/deploy/' + secret, {
			data: '{"ref": "aa/aa/master"}',
			headers: {"Content-Type": "application/json"}
		}).on('complete', function() {
			
			wl.close();
			test.ok(configurationManager.assert());
			test.done();
		});
	});
};

exports.testGetDeployError = function(test) {
	
	var port = 4234;
	var secret = 'aadssd';
	var repoInfo = {
		name: 'name',
		type: 'github',
		location: 'location',
		logpath: 'logpath',
		secret: secret
	};
	var configurationManager = nodemock.mock('getRepositoryInfo').takes(secret).returns(repoInfo);
	var github = nodemock.mock('checkForDeploy').takes(repoInfo, '{"ref": "aa/aa/master"}').returns(true);
	github.mock('getUpdates').takes(repoInfo, function() {}).calls(1);
	var deployer = nodemock.mock('deploy').takes(repoInfo.name, repoInfo.location, repoInfo.logpath, function() {}).calls(3, [{}]);

	var repositories = {
		"github": github
	};

	var wl = new WebhookListener(configurationManager, repositories, deployer, new Notifiers());

	wl.listen(port, function() {
		
		rest.post('http://localhost:' + port + '/deploy/' + secret, {
			data: '{"ref": "aa/aa/master"}',
			headers: {"Content-Type": "application/json"}
		}).on('complete', function() {
			
			wl.close();
			test.ok(configurationManager.assert());
			test.done();
		});
	});
};

exports.testGetDeployOK = function(test) {
	
	var port = 4234;
	var secret = 'aadssd';
	var repoInfo = {
		name: 'name',
		type: 'github',
		location: 'location',
		logpath: 'logpath',
		secret: secret
	};
	var configurationManager = nodemock.mock('getRepositoryInfo').takes(secret).returns(repoInfo);
	var github = nodemock.mock('checkForDeploy').takes(repoInfo, '{"ref": "aa/aa/master"}').returns(true);
	github.mock('getUpdates').takes(repoInfo, function() {}).calls(1);
	var deployer = nodemock.mock('deploy').takes(repoInfo.name, repoInfo.location, repoInfo.logpath, function() {}).calls(3, []);

	var repositories = {
		"github": github
	};

	var wl = new WebhookListener(configurationManager, repositories, deployer, new Notifiers());

	wl.listen(port, function() {
		
		rest.post('http://localhost:' + port + '/deploy/' + secret, {
			data: '{"ref": "aa/aa/master"}',
			headers: {"Content-Type": "application/json"}
		}).on('complete', function() {
			
			wl.close();
			test.ok(configurationManager.assert());
			test.done();
		});
	});
};
