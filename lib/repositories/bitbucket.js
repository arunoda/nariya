/**

	BitBucker get repository for allowing to get the updates
*/

var logger = require('winstoon').createLogger('repositories/bitbucket');
var exec = require('child_process').exec;

module.exports = Repository;

function Repository() {
	
	/**
		Whether to deploy or not? this decision is taken here by analyzing http request data send by the webhook and
		the configuration provided

		@returns true or false
	*/
	this.checkForDeploy = function(repositoryInfo, httpPayload) {
	
		var payloadText = httpPayload.substr(8).replace(/\+/g, '%20');
		var payload = JSON.parse(unescape(payloadText));

		var allowed = true;
		for(var index in payload.commits) {
			var commit = payload.commits[0];
			if(commit.branch == repositoryInfo.branch) {
				allowed = true;
				break;
			}	
		}

		logger.info('branch checking', {needed: repositoryInfo.branch});

		return allowed;
	};


	/**
		Goto the @location and give an git pull origin master
	*/
	this.getUpdates = function(repositoryInfo, callback) {
		
		logger.info('getting repo updates', {type: 'bitbucket', appname: repositoryInfo.name});
		var branch = repositoryInfo.branch || 'master';
		exec('git pull origin ' + branch, {cwd: repositoryInfo.location}, function(err, stdout, stderr) {
			
			if(err) {

				//some error with the exec
				callback(err);
			} else {
				
				//success
				callback(null, stdout);
			}

		});
	};

}