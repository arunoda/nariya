var logger = require('winstoon').createLogger('webhookListener');
var express = require('express');
var Deployer = require('./deployer');

module.exports = WebhookListener;

function WebhookListener(configurationManager, repositories, deployer) {
		
	var app = express.createServer();
	app.use(express.bodyParser());

	app.post('/deploy/:secret', function(req, res) {
		
		var repoInfo = configurationManager.getRepositoryInfo(req.params.secret);
		if(repoInfo) {
			
			logger.info('receiving valid deployment request', {appname: repoInfo.name, secret: req.params.secret});
			//check for the repository type
			var repository = repositories[repoInfo.type];
			if(repository) {
				
				//check for deployment
				var allowToDeploy = repository.checkForDeploy(repoInfo, req.rawBody);
				if(allowToDeploy) {
					repository.getUpdates(repoInfo, afterRepoUpdated);
				} else {
					logger.info('not allowed to deploy', {appname: repoInfo.name});
					res.send();
				}
			} else {

				logger.warn('repository type not exists', {appname: repoInfo.name, type: repoInfo.type});
				res.send();
			}

		} else {

			logger.warn('invalid deploy request', {secret: req.params.secret});
			res.send();
		}

		function afterRepoUpdated(err) {
			
			if(!err) {
				
				deployer.deploy(repoInfo.name, repoInfo.location, repoInfo.logpath, afterDeployed);
			} else {
				logger.error('repository update failed', {err: err, appname: repoInfo.name});
				res.send();
			}
		}

		function afterDeployed(err, deployed) {
			
			if(!err) {
				logger.info('deployment succeded', {appname: repoInfo.name});
				res.send();
			} else {
				logger.error('deployment failed', {appname: repoInfo.name, err: err});
				res.send();
			}
		}
	});

	this.listen = function(port, callback) {
		app.listen(port, callback);
	};

	this.close = function() {
		app.close();
	};
}
