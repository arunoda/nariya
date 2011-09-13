module.exports = {
	info: log,
	log: log,
	debug: log,
	error: log	
};

function log(string, obj) {
	console.log(string + ' - ' + JSON.stringify(obj));
};