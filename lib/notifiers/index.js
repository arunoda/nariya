var Email = require('./email');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports = Notifiers;

function Notifiers() {
	
	var self = this;

	this.addEmail = function(emailInfo) {
		
		var email = new Email(emailInfo);
		self.on('deploy.success', function(appname) {
			var message = "Successfully Deployed on: " + new Date();
			var title = "Successfully Deployed";
			email.send(appname, title, message);
		});

		self.on('deploy.failed', function(appname, err) {
			
			var message = "Deployment failed due to: \n\n " + err.message;
			message += '\n\nmore:\n' + JSON.stringify(err);
			var title =  "Deployment Failed";
			email.send(appname, title, message);
		});
	};
}

util.inherits(Notifiers, EventEmitter);

