var cjson = require('cjson');
var fs = require('fs');
var logger = require('winstoon').createLogger('configurationManager');

module.exports = ConfigurationManager;

/**
	Watch for a the @configFile config file and gives the config info as asked
*/
function ConfigurationManager(configFile) {
	

	var self = this;
	var repositories = {};
	var emailInfo;

	this.rawData;

	/**
		Get the repository info index by the @secretKey
		in the config file
	*/
	this.getRepositoryInfo = function(secretKey) {
		return repositories[secretKey];
	};

	this.getEmailInfo = function() {
		return this.rawData.emailInfo;
	};

	this.getServerInfo = function() {
		return this.rawData.server;	
	};

	this.update = function (callback) {

		fs.readFile(configFile, 'utf-8', function (err, data) {
			
			if(!err) {
				var data = cjson.parse(data);	
				self.rawData = data;
				logger.info('loading config loaded', {file: configFile});

				//reset the repositories
				repositories = {};

				for(var repoName in data.repositories) {

					logger.debug('adding repo', {name: repoName});
					var entry = data.repositories[repoName];
					entry.name = repoName;
					repositories[entry.secret] = entry;
				}

				emailInfo = data.emailInfo;
				callback();

			} else {
				logger.error('error reading config file', {file: configFile, err: err});
				callback(err);		
			}
		});
	}

	this.updateSync = function() {
	
		var data = fs.readFileSync(configFile, 'utf-8');
		logger.info('loading config loaded', {file: configFile});
			
				
		var data = cjson.parse(data);	
		self.rawData = data;
		logger.info('loading config loaded', {file: configFile});

		//reset the repositories
		repositories = {};

		for(var repoName in data.repositories) {

			logger.debug('adding repo', {name: repoName});
			var entry = data.repositories[repoName];
			entry.name = repoName;
			repositories[entry.secret] = entry;
		}

	}
}

