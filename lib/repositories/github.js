module.exports = GithubRepository;

function GithubRepository() {
	
	/**
		Whether to deploy or not? this decision is taken here by analyzing http request data send by the webhook and
		the configuration provided

		@returns true or false
	*/
	this.checkForDeploy = function(repositoryInfo, httpData) {
		
	};
}