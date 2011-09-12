#!/usr/bin/env node
var argv = require('optimist')
    .usage('\nUsage: nariya --api [port] workerPort1 workerPort2 ..')
    .demand(['api', '_'])
    .argv;

var winstoon = require('winstoon');
winstoon.add(winstoon.transports.Console);
var EventEmitter = require('events').EventEmitter;

var eventBus = new EventEmitter();
var api = require('../lib/api').load(argv._, process.cwd(), eventBus);
var httpApi = require('../lib/httpApi').load(argv.api, api, eventBus);