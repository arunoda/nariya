var BitBucketRepository = require('repositories/bitbucket');

exports.testCheck = function (test) {

	var bitbucket = new BitBucketRepository();
	var repositoryConfig = {
		branch: 'master'
	};

	var resp = bitbucket.checkForDeploy(repositoryConfig, getHttpPayload());
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
	
	var httpPayload = "payload=%7B%22repository%22%3A+%7B%22website%22%3A+%22%22%2C+%22fork%22%3A+false%2C+%22name%22%3A+%22nariya-helloworld%22%2C+%22scm%22%3A+%22git%22%2C+%22absolute_url%22%3A+%22%2Farunoda%2Fnariya-helloworld%2F%22%2C+%22owner%22%3A+%22arunoda%22%2C+%22slug%22%3A+%22nariya-helloworld%22%2C+%22is_private%22%3A+true%7D%2C+%22commits%22%3A+%5B%7B%22node%22%3A+%227f040e252431%22%2C+%22files%22%3A+%5B%7B%22type%22%3A+%22modified%22%2C+%22file%22%3A+%22text.txt%22%7D%5D%2C+%22branch%22%3A+%22master%22%2C+%22utctimestamp%22%3A+%222011-12-07+18%3A41%3A32%2B00%3A00%22%2C+%22author%22%3A+%22arunoda%22%2C+%22timestamp%22%3A+%222011-12-07+19%3A41%3A32%22%2C+%22raw_node%22%3A+%227f040e252431e78a1d33eac88c41a67217348f9f%22%2C+%22parents%22%3A+%5B%229b2aa5c9fe9c%22%5D%2C+%22raw_author%22%3A+%22Arunoda+Susiripala+%3Carunoda.susiripala%40gmail.com%3E%22%2C+%22message%22%3A+%22text.txt+modified%5Cn%22%2C+%22size%22%3A+-1%2C+%22revision%22%3A+null%7D%5D%2C+%22canon_url%22%3A+%22https%3A%2F%2Fbitbucket.org%22%2C+%22user%22%3A+%22arunoda%22%7D"
	return httpPayload;
}