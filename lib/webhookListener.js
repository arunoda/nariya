var logger = require('winstoon').createLogger('webhookListener');
var express = require('express');
var Deployer = require('./deployer');

module.exports = WebhookListener;

function WebhookListener(configurationManager, repositories, deployer, notifiers) {
		
	var app = express.createServer();
	app.use(rawBodyMiddleware());

	app.post('/deploy/:secret', function(req, res) {
		
		res.send(' ');
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
				}
			} else {

				logger.warn('repository type not exists', {appname: repoInfo.name, type: repoInfo.type});
			}

		} else {

			logger.warn('invalid deploy request', {secret: req.params.secret});
		}

		function afterRepoUpdated(err) {
			
			if(!err) {
				
				deployer.deploy(repoInfo, afterDeployed);
			} else {
				logger.error('repository update failed', {err: err, appname: repoInfo.name});
				notifiers.emit('deploy.failed', repoInfo.name, err);
			}
		}

		function afterDeployed(err, deployed) {
			
			if(!err) {
				logger.info('deployment succeded', {appname: repoInfo.name});
				notifiers.emit('deploy.success', repoInfo.name);
			} else {
				logger.error('deployment failed', {appname: repoInfo.name, err: err});
				notifiers.emit('deploy.failed', repoInfo.name, err);
			}
		}
	});

	this.listen = function(port, callback) {

		logger.info('WebhookListner started', {port: port});
		app.listen(port, callback);
	};

	this.close = function() {
		app.close();
	};

	function rawBodyMiddleware(){
		
		return function rawBodyMiddleware(req, res, next) {

			if ('GET' == req.method || 'HEAD' == req.method) return next();

			var data = '';
			req.setEncoding('utf8');
			req.on('data', function(chunk) { data += chunk; });
			req.on('end', function(){
				req.rawBody = data;
				next();
			});
		}
	}
}
