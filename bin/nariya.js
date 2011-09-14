#!/usr/bin/env node
var argv = require('optimist')
    .usage('\nUsage: nariya --api [port] workerPort1 workerPort2 ..')
    .demand(['api', '_'])
    .argv;

var winstoon = require('winstoon');
winstoon.add(winstoon.transports.Console);
var EventEmitter = require('events').EventEmitter;
var jsonReader = require('../lib/jsonReader');
var path = require('path');

//get the content of package.json
var packageJson = path.resolve(process.cwd(), 'package.json');
jsonReader(packageJson, function(err, content) {
	
	if(!err) {
		
		if(content.name) {
			
			var eventBus = new EventEmitter();
			var api = require('../lib/api').load(content.name, argv._, process.cwd(), eventBus);
			var httpApi = require('../lib/httpApi').load(argv.api, api, eventBus);

		} else {
			console.log('+++ name not exists in the package.json');
		}

	} else {
		console.log('+++ package.json file not exists or invalid');
	}
});