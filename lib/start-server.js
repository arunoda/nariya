//check for production
var isProduction = process.env.NODE_ENV == 'production';

//load the logger
var winstoon = require('winstoon');
winstoon.add(winstoon.transports.Console, {timestamp: true});
var logger = winstoon.createLogger('start-server');

//load the configuration manager
var ConfigurationManager = require('./configurationManager');
var configurationManager;
var path = require('path');
if(isProduction) {
	var confFile = path.resolve(process.env.HOME, '.nariya/nariya.conf');
	configurationManager = new ConfigurationManager(confFile);
} else {
	var confFile = path.resolve(__dirname, '../conf/nariya.conf');
	configurationManager = new ConfigurationManager(confFile);
}
configurationManager.updateSync();

//load the deployer
var Deployer = require('./deployer');
var deployer = new Deployer();

//load the emailSender
var EmailSender = require('./emailSender');
var emailSender = new EmailSender(configurationManager.getEmailInfo());

//var repositories
var repositories = require('./repositories');

//load the webhook listener
var WebhookListener = require('./webhookListener');
var webhookListener = new WebhookListener(configurationManager, repositories, deployer);
webhookListener.listen(configurationManager.getServerInfo().port);

