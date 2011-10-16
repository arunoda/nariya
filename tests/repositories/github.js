var GithubRepository = require('repositories/github');

exports.testCheck = function (test) {

	var github = new GithubRepository();
	var repositoryConfig = {
		branch: 'master'
	};

	var resp = github.checkForDeploy(repositoryConfig, getHttpPayload());
	test.ok(resp);

	test.done();
};

// this test is location dependant and result cannot be predicted without manual interaction
// so please have an 
// exports.testDeploy = function(test) {

// 	var repositoryConfig = {
// 		branch: 'master'
// 	};

// 	var github = new GithubRepository();
// 	github.getUpdates(repositoryConfig, function(err, out) {
// 		console.log(err);
// 		test.ok(!err);
// 		test.done();
// 	});	
// };

function getHttpPayload() {
	
	var httpPayload = "payload=%7B%22pusher%22%3A%7B%22name%22%3A%22none%22%7D%2C%22repository%22%3A%7B%22name%22%3A%22nariya-helloworld%22%2C%22created_at%22%3A%222011%2F09%2F11%2007%3A25%3A11%20-0700%22%2C%22size%22%3A6396%2C%22has_wiki%22%3Atrue%2C%22private%22%3Afalse%2C%22watchers%22%3A2%2C%22url%22%3A%22https%3A%2F%2Fgithub.com%2Farunoda%2Fnariya-helloworld%22%2C%22fork%22%3Afalse%2C%22language%22%3A%22JavaScript%22%2C%22pushed_at%22%3A%222011%2F10%2F15%2018%3A28%3A02%20-0700%22%2C%22has_downloads%22%3Atrue%2C%22open_issues%22%3A0%2C%22homepage%22%3A%22%22%2C%22has_issues%22%3Atrue%2C%22forks%22%3A2%2C%22description%22%3A%22Nariya%20Helloworld%20App%22%2C%22owner%22%3A%7B%22name%22%3A%22arunoda%22%2C%22email%22%3A%22arunoda.susiripala%40gmail.com%22%7D%7D%2C%22forced%22%3Afalse%2C%22after%22%3A%22bdde4a6fb0e9e278b6362ebf5ddcdcacd1da2edc%22%2C%22deleted%22%3Afalse%2C%22ref%22%3A%22refs%2Fheads%2Fmaster%22%2C%22commits%22%3A%5B%7B%22added%22%3A%5B%5D%2C%22modified%22%3A%5B%22text.txt%22%5D%2C%22timestamp%22%3A%222011-09-17T13%3A34%3A54-07%3A00%22%2C%22author%22%3A%7B%22name%22%3A%22Arunoda%20at%20Fashona%22%2C%22username%22%3A%22arunoda%22%2C%22email%22%3A%22arunoda.susiripala%40gmail.com%22%7D%2C%22removed%22%3A%5B%5D%2C%22url%22%3A%22https%3A%2F%2Fgithub.com%2Farunoda%2Fnariya-helloworld%2Fcommit%2F275ecf054c18912f681c2ce44b162d8c2872ebcd%22%2C%22id%22%3A%22275ecf054c18912f681c2ce44b162d8c2872ebcd%22%2C%22distinct%22%3Atrue%2C%22message%22%3A%22text.txt%20updated%22%7D%2C%7B%22added%22%3A%5B%5D%2C%22modified%22%3A%5B%22text.txt%22%5D%2C%22timestamp%22%3A%222011-09-17T13%3A35%3A05-07%3A00%22%2C%22author%22%3A%7B%22name%22%3A%22Arunoda%20at%20Fashona%22%2C%22username%22%3A%22arunoda%22%2C%22email%22%3A%22arunoda.susiripala%40gmail.com%22%7D%2C%22removed%22%3A%5B%5D%2C%22url%22%3A%22https%3A%2F%2Fgithub.com%2Farunoda%2Fnariya-helloworld%2Fcommit%2Feb84f603163a26b8bc54b753bb0c744fd8fb18b9%22%2C%22id%22%3A%22eb84f603163a26b8bc54b753bb0c744fd8fb18b9%22%2C%22distinct%22%3Atrue%2C%22message%22%3A%22text.txt%20updated%22%7D%2C%7B%22added%22%3A%5B%5D%2C%22modified%22%3A%5B%22start.js%22%5D%2C%22timestamp%22%3A%222011-10-15T18%3A27%3A47-07%3A00%22%2C%22author%22%3A%7B%22name%22%3A%22Arunoda%20Susiripala%22%2C%22username%22%3A%22arunoda%22%2C%22email%22%3A%22arunoda.susiripala%40gmail.com%22%7D%2C%22removed%22%3A%5B%5D%2C%22url%22%3A%22https%3A%2F%2Fgithub.com%2Farunoda%2Fnariya-helloworld%2Fcommit%2Fbdde4a6fb0e9e278b6362ebf5ddcdcacd1da2edc%22%2C%22id%22%3A%22bdde4a6fb0e9e278b6362ebf5ddcdcacd1da2edc%22%2C%22distinct%22%3Atrue%2C%22message%22%3A%22added%20support%20for%20nariya%200.1%22%7D%5D%2C%22compare%22%3A%22https%3A%2F%2Fgithub.com%2Farunoda%2Fnariya-helloworld%2Fcompare%2Fd4cd9c7...bdde4a6%22%2C%22before%22%3A%22d4cd9c7bdc50c208fe1d24b5207c3ee5d20a9749%22%2C%22created%22%3Afalse%7D"
	return httpPayload;
}