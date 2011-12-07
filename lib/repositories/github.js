/**

	Github repository for allowing to get the updates
*/

var logger = require('winstoon').createLogger('repositories/github');
var exec = require('child_process').exec;

module.exports = GithubRepository;

function GithubRepository() {
	
	/**
		Whether to deploy or not? this decision is taken here by analyzing http request data send by the webhook and
		the configuration provided

		@returns true or false
	*/
	this.checkForDeploy = function(repositoryInfo, httpPayload) {
	
		var payloadText = httpPayload.substr(8);
		var payload = JSON.parse(unescape(payloadText));
		var ref = payload.ref;
		var branch = ref.split('/')[2];

		logger.info('branch checking', {needed: repositoryInfo.branch, received: branch});
		
		return repositoryInfo.branch == branch;
	};


	/**
		Goto the @location and give an git pull origin master
	*/
	this.getUpdates = function(repositoryInfo, callback) {
		
		logger.info('getting repo updates', {type: 'github', appname: repositoryInfo.name});
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