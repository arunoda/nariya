/**
	Available Events
	----------------

	* notify.masterDeployed - port
	* notify.error.materDeploy - port, error
	* notify.startWorkersDeployment - port
	* notify.workerDeployed - port
	* notify.error.workerDeploy - port. error
	* notify.deployed
	* notify.error.deployed - error

		@param ports is the workers ports (one worker can have many ports)
	* workerKilled ports, appLocation, logFile, errorCode 

	Email Notifier For Nariya
*/

var jsonReader = require('../jsonReader');
var path = require('path');
var logger = require('winstoon').createLogger('plugins/email');
var nodemailer = require('nodemailer');

/**
	@params packageJs - parsed package.json
	@params eventBus - EventEmiiter instance
*/
exports.load = function(packageJs, eventBus) {
		
	var confFilePath = path.resolve(process.cwd(), 'email.json');
	jsonReader(confFilePath, function(err, config) {

		if(!err) {
			
			if(config.smtp && config.me && config.receivers) {
				
				logger.info('Email Plugin started');
				startWaching(config);	
			} else {
				
				logger.error('Email plugin is not started due to invalid conf');
			}

		} else {

			logger.error('Email Plugin is not started due to invalid conf file');
		}
		
	});


	function startWaching(config) {
				
		nodemailer.SMTP = config.smtp;

		//when app get deployed
		eventBus.on('notify.deployed', function() {

			logger.info("email for success deployment");
			var title = "Deployment Succeeded";
			var message = "App Successfully Deployed on: " + new Date().toUTCString();
			sendEmail(title, message, function(error, success) {
				
				if(success) {
					logger.info('email sending ok', {title: title});
				} else {
					logger.error('email sending failed', {title: title, err: error});
				}
			});
		});

		//when app deployment failed
		eventBus.on('notify.error.deployed', function(err) {

			logger.info("email for failed deployment");
			var title = "Deployment Failed";
			var message = "App Deployment failed on: " + new Date().toUTCString();
			message += '\nMore Info\n\n' + JSON.stringify(err);

			sendEmail(title, message, function(error, success) {
				
				if(success) {
					logger.info('email sending ok', {title: title});
				} else {
					logger.error('email sending failed', {title: title, err: error});
				}
			});
		});

		//when a worker got restored
		eventBus.on('workerRestored', function(ports) {

			logger.info("email for worker restoration", {ports: ports});
			var title = "Worker(" + ports +") Crashed and Restored.";
			var message = "Worker: "  + ports + ' restored on: ' + new Date().toUTCString();

			sendEmail(title, message, function(error, success) {
				
				if(success) {
					logger.info('email sending ok', {title: title});
				} else {
					logger.error('email sending failed', {title: title, err: error});
				}
			});
		});


		function sendEmail() {
			
			var title = arguments[0];
			var message = arguments[1];
			var callback, reply;


			if(arguments[3]) {
				reply = " Re: ";
				callback = arguments[3];
			} else {
				reply = " ";
				callback = arguments[2];
			}

			var htmlMessage = message.replace(/\n/g, '<br>');
			// send an e-mail
			nodemailer.send_mail(

				{
					sender: config.me.name + '<' + config.me.email + '>',
					to: config.receivers.join(', '),
					subject: '[CD: ' + packageJs.name +']' + reply + title ,
					html: '<h3> Continious Deployment Info - ' + packageJs.name + ' </h3>' + htmlMessage,
					body: 'Continious Deployment Info - ' + packageJs.name + '\n\n' + message
				},

				callback
			);
		}
	}

};

/**
	
	

*/