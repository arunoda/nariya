var express = require('express');
var logger = require('./logger');

/**
	HTTP API for the deployment

	@param port - port the api should launch
	@param api - Main API
	@param eventBus - the event Bus
*/
exports.load = function(port, api, eventBus) {
	return new HttpApi(port, api, eventBus);
};

function HttpApi(port, api, eventBus) {
	
	var app = express.createServer();

	app.post('/deploy', function(req, res) {
		
		api.deploy();
		res.send('Deployment Started');
	});

	logger.info('starting HTTP Api', {port: port});
	app.listen(port);

	this.close = function() {
		logger.info('closing the HTTP Api', {port: port});
		app.close();	
	};
}