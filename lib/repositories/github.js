/**

	Github repository for allowing to get the updates
*/

var exec = require('child_process').exec;

module.exports = GithubRepository;

function GithubRepository() {
	
	/**
		Whether to deploy or not? this decision is taken here by analyzing http request data send by the webhook and
		the configuration provided

		@returns true or false
	*/
	this.checkForDeploy = function(repositoryInfo, httpPayload) {
	
		var payload = JSON.parse(httpPayload);
		var ref = payload.ref;
		var branch = ref.split('/')[2];

		return repositoryInfo.branch == branch;
	};


	/**
		Goto the @location and give an git pull origin master
	*/
	this.getUpdates = function(location, callback) {
		
		exec('git pull origin master', {cwd: location}, function(err, stdout, stderr) {
			
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