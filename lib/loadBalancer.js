/**
	Load Balancer of the Nariya
	Uses Node-Http-Proxy undeline

	@param port - port where load balancer should runs
	@param eventBus - eventEmitter
*/

var winstoon = require('winstoon');
var logger = winstoon.createLogger('loadBalancer');
var httpProxy = require('http-proxy');

exports.load = function(port, eventBus) {
	return new LoadBalancer(port, eventBus);
};

function LoadBalancer(port, eventBus) {

	var entries = {};
	var hostsList = []; //list of hosts currently in balancing
	var hostIndex = 0; //the index of the host next to be used

	var master = null;

	
	logger.info('load balancer started', {port: port});
	httpProxy.createServer(function (req, res, proxy) {

		if(hostIndex >= hostsList.count) {
			hostIndex = 0;
		}

		var host = hostsList[hostIndex];
		var ports = entries[host];
		if(!ports || ports.length == 0) {
			//no ports available to balance
			logger.error('no ports available to balance', {host: host});
			res.end();
		} else {
			var pick = ports[Math.floor(Math.random() * ports.length)];
			proxy.proxyRequest(req, res, {
				host: host,
				port: pick
			});
		}

	}).listen(port);

	this.addEntry = function(host, port) {
		
		logger.info('adding new entry', {host: host, port: port});
		if(!entries[host]) {
			entries[host] = [];
		}

		entries[host].push(port);
		resetHostsList();
	};

	this.removeEntry = function(host, port) {
		
		logger.info('removing entry', {host: host, port: port});
		var ports = entries[host];
		if(ports) {

			var index = ports.indexOf(port);
			if(index >= 0) {
				//remove the master if this is
				master = (master.host == host && master.port == port)? null: master;
				ports.splice(index, 1);
				resetHostsList();
				return true;
			} else {
				return false;
			}
		} else {

			return false;
		}
	};

	function resetHostsList() {
		
		hostIndex = 0;
		hostsList = [];
		for(host in entries) {
			hostsList.push(host);
		}
	}

	this.getPorts = function(host) {
	
		logger.info('requesting ports for', {host: host});
		return (entries[host])? entries[host] : [];	
	};

	this.setMaster = function(host, port) {
		
		logger.info('setting master', {host: host, port: port});
		master = {host: host, port: port};
		this.addEntry(host, port);
	};

	this.removeSlaves = function(host) {

		logger.info('removing slaves of', {host: host});
		var ports = entries[host];
		if(ports && master) {
			//setting master port only to the new list
			var removedPorts = ports;
			entries[host] = [master.port]

			//removing master port
			var masterPortIndex = removedPorts.indexOf(master.port);
			removedPorts.slice(masterPortIndex, 1);
			return removedPorts;
		} else {
			return [];
		}
	};

	/**
		Load balance only using the given host
		@param host - host to only use to balance
	*/
	this.balanceOnlyWith = function(host) {

		logger.info('restricting balance only for',{host: host});
		hostsList = [host];
		hostIndex = 0;
	};

	/**
		Load balance using all available ports
	*/
	this.balanceAll = function() {

		logger.info('balance using all avaible entries');
		resetHostsList();
	};
}