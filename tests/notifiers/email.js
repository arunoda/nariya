var EmailSender = require('notifiers/email');

// exports.testSendSuccess = function(test) {
	
// 	var emailInfo = {
// 		"smtp": {
// 			"host": "smtp.gmail.com",
// 			"port": 587,
// 			"ssl": false,
// 			"use_authentication": true,
// 			"user": "admin@****.com",
// 			"pass": "*************"
// 		},

// 		"me": {
// 			"name": "Arunoda Susiripala",
// 			"email": "**@****cloud.com"
// 		},

// 		"receivers": [
// 			"*******.susiripala@gmail.com",
// 			"****@**.com"
// 		]
// 	}

// 	var emailSender = new EmailSender(emailInfo);
// 	emailSender.send('The App', 'The title', 'This is the message\nHello', function(err) {
// 		console.log(err);
// 		test.ok(!err);
// 		test.done();
// 	});
// };