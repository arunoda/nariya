var logger = require('winstoon').createLogger('notifiers/email');
var nodemailer = require('nodemailer');

module.exports = EmailSender;

function EmailSender(emailInfo) {

	nodemailer.SMTP = emailInfo.smtp;
	this.send = function(appname, title, message, callback) {
		
		logger.info('sending email', {appname: appname, title: title});

		var htmlMessage = message.replace(/\n/g, '<br>');
		// send an e-mail
		nodemailer.send_mail(

			{
				sender: emailInfo.me.name + '<' + emailInfo.me.email + '>',
				to: emailInfo.receivers.join(', '),
				subject: '[CD] ' + appname +' - ' + title ,
				html: '<h3> Continious Deployment Info - ' + appname + ' </h3>' + htmlMessage,
				body: 'Continious Deployment Info - ' + appname + '\n\n' + message
			},

			callback
		);
	};
}
