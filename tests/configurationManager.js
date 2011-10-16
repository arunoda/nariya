var ConfigurationManager = require('configurationManager');
var path = require('path');

exports.testUpdate = function(test) {
	
	var confFile = path.resolve(__dirname, '../conf/nariya.conf');
	var cm = new ConfigurationManager(confFile);
	cm.update(function(err) {
		
		console.log(err);
		test.ok(!err);
		var repo = cm.getRepositoryInfo('the-secret');
		test.ok(repo);
		test.equal('the location', repo.location);
		test.equal('the-secret', repo.secret);
		test.equal('the-name', repo.name);
		test.equal('github', repo.type);

		test.done();
	});
};

exports.testUpdateError = function(test) {
	
	var confFile = path.resolve(__dirname, '../conf/nariya.confssd');
	var cm = new ConfigurationManager(confFile);
	cm.update(function(err) {
		
		test.ok(err);
		test.done();
	});
};

exports.testGetEmailInfo = function(test) {
	
	var confFile = path.resolve(__dirname, '../conf/nariya.conf');
	var cm = new ConfigurationManager(confFile);
	cm.update(function(err) {
		
		test.ok(!err);
		test.ok(cm.getEmailInfo());

		test.done();
	});
};