var path =  require('path');
var fs = require('fs');
var logger = require('winstoon').createLogger('jsonReader');

/**
	Read the JSON file in a given path and return the parsed content
	@param jsonFilePath - path where JSON file exists
	@parsed callback - return the response as the callback
		function(err, packageJson) {}
*/
module.exports = function(jsonFilePath, callback) {
	
	var file = path.resolve(jsonFilePath);
	fs.readFile(file, 'utf8', function(err, data) {
		
		if(!err) {
			
			try {
				var content = JSON.parse(data);
				callback(null, content);
			} catch(parseError) {
				logger.error('package.json parse error', {file: file, err: parseError});
				callback(parseError);
			}
		} else {
			logger.error('file not exists', {file: file, err: err});
			callback(err);
		}
	});
};