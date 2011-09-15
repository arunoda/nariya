/**

	Parse ports given as the parameter

	@param portlists - list of portlists (Array or single entry)
	@returns - lists of arrays(ports) or null in the error
*/
module.exports = function(portlists) {
	
	var workerPorts = [];
	if(portlists instanceof Array) {
		//if there are more than one portlists (more than one worker)

		for(var index in portlists) {
			
			var portlist = portlists[index];
			var ports = parsePortList(portlist);

			if(ports == null) { //if there is an error the parsing
				return null; //return null for indicating error
			} else {
				workerPorts.push(ports);
			}
		}

	} else {
		//portlist is an single string		
		var ports = parsePortList(portlists);

		if(ports == null) { //if there is an error the parsing
			return null; //return null for indicating error
		} else {
			workerPorts.push(ports);
		}
	}

	return workerPorts;
};

function parsePortList(portlist) {
	
	portlist = '' + portlist;
	var ports = portlist.split(',');
	for(var index in ports) {

		var port = parseInt(ports[index]);
		
		if(isNaN(port)) { //if there is an error the parsing
			return null; //return null for indicating error
		} else {
			ports[index] = port;
		}
	}
	return ports;
}