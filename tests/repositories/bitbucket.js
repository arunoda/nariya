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

exports.testCheckForWrongBranch = function (test) {

	var bitbucket = new BitBucketRepository();
	var repositoryConfig = {
		branch: 'master'
	};

	var payload = 'payload=%7B%22repository%22%3A+%7B%22website%22%3A+%22%22%2C+%22fork%22%3A+false%2C+%22name%22%3A+%22schema-executor%22%2C+%22scm%22%3A+%22git%22%2C+%22absolute_url%22%3A+%22%2Farunoda%2Fschema-executor%2F%22%2C+%22owner%22%3A+%22arunoda%22%2C+%22slug%22%3A+%22schema-executor%22%2C+%22is_private%22%3A+true%7D%2C+%22commits%22%3A+%5B%7B%22node%22%3A+%22d3ce75cab875%22%2C+%22files%22%3A+%5B%7B%22type%22%3A+%22modified%22%2C+%22file%22%3A+%22readme.md%22%7D%5D%2C+%22branch%22%3A+%22feature-inc-db-update%22%2C+%22utctimestamp%22%3A+%222011-12-14+11%3A57%3A45%2B00%3A00%22%2C+%22author%22%3A+%22arunoda%22%2C+%22timestamp%22%3A+%222011-12-14+12%3A57%3A45%22%2C+%22raw_node%22%3A+%22d3ce75cab8754716df64bde08d3645f983cf1e35%22%2C+%22parents%22%3A+%5B%22b46237fb3225%22%5D%2C+%22raw_author%22%3A+%22Arunoda+Susiripala+%3Carunoda.susiripala%40gmail.com%3E%22%2C+%22message%22%3A+%22readme+changed%5Cn%22%2C+%22size%22%3A+-1%2C+%22revision%22%3A+null%7D%5D%2C+%22canon_url%22%3A+%22https%3A%2F%2Fbitbucket.org%22%2C+%22user%22%3A+%22arunoda%22%7D';

	var resp = bitbucket.checkForDeploy(repositoryConfig, payload);
	test.ok(!resp);

	test.done();
};

exports.testCheckMultiCommits = function (test) {

	var bitbucket = new BitBucketRepository();
	var repositoryConfig = {
		branch: 'master'
	};

	var payload = 'payload=%7B%22repository%22%3A+%7B%22website%22%3A+%22http%3A%2F%2Fkodeincloud.com%2F%22%2C+%22fork%22%3A+false%2C+%22name%22%3A+%22appzone-cloud-simulator%22%2C+%22scm%22%3A+%22git%22%2C+%22absolute_url%22%3A+%22%2Farunoda%2Fappzone-cloud-simulator%2F%22%2C+%22owner%22%3A+%22arunoda%22%2C+%22slug%22%3A+%22appzone-cloud-simulator%22%2C+%22is_private%22%3A+true%7D%2C+%22commits%22%3A+%5B%7B%22node%22%3A+%221d4f6d526b31%22%2C+%22files%22%3A+%5B%7B%22type%22%3A+%22modified%22%2C+%22file%22%3A+%22package.json%22%7D%5D%2C+%22branches%22%3A+%5B%5D%2C+%22branch%22%3A+null%2C+%22utctimestamp%22%3A+%222011-12-10+09%3A48%3A43%2B00%3A00%22%2C+%22author%22%3A+%22arunoda%22%2C+%22timestamp%22%3A+%222011-12-10+10%3A48%3A43%22%2C+%22raw_node%22%3A+%221d4f6d526b31b7d677f3cb79022db8be27339b55%22%2C+%22parents%22%3A+%5B%2288bba5d7c13e%22%5D%2C+%22raw_author%22%3A+%22Arunoda+Susiripala+%3Carunoda.susiripala%40gmail.com%3E%22%2C+%22message%22%3A+%22added+spaces+to+readme%5Cn%22%2C+%22size%22%3A+-1%2C+%22revision%22%3A+null%7D%2C+%7B%22node%22%3A+%22dd7e13fafaf3%22%2C+%22files%22%3A+%5B%7B%22type%22%3A+%22modified%22%2C+%22file%22%3A+%22package.json%22%7D%5D%2C+%22branches%22%3A+%5B%5D%2C+%22branch%22%3A+null%2C+%22utctimestamp%22%3A+%222011-12-10+09%3A48%3A59%2B00%3A00%22%2C+%22author%22%3A+%22arunoda%22%2C+%22timestamp%22%3A+%222011-12-10+10%3A48%3A59%22%2C+%22raw_node%22%3A+%22dd7e13fafaf34ea6624a12ea9221051b32fa6251%22%2C+%22parents%22%3A+%5B%221d4f6d526b31%22%5D%2C+%22raw_author%22%3A+%22Arunoda+Susiripala+%3Carunoda.susiripala%40gmail.com%3E%22%2C+%22message%22%3A+%22added+removed+to+readme%5Cn%22%2C+%22size%22%3A+-1%2C+%22revision%22%3A+null%7D%2C+%7B%22node%22%3A+%22a0e0cfed8eb2%22%2C+%22files%22%3A+%5B%7B%22type%22%3A+%22modified%22%2C+%22file%22%3A+%22readme.md%22%7D%5D%2C+%22branch%22%3A+%22master%22%2C+%22utctimestamp%22%3A+%222011-12-10+09%3A49%3A11%2B00%3A00%22%2C+%22author%22%3A+%22arunoda%22%2C+%22timestamp%22%3A+%222011-12-10+10%3A49%3A11%22%2C+%22raw_node%22%3A+%22a0e0cfed8eb2ed8f1154c24b943e5959d01bad05%22%2C+%22parents%22%3A+%5B%22dd7e13fafaf3%22%5D%2C+%22raw_author%22%3A+%22Arunoda+Susiripala+%3Carunoda.susiripala%40gmail.com%3E%22%2C+%22message%22%3A+%22added+removed+to+readme%5Cn%22%2C+%22size%22%3A+-1%2C+%22revision%22%3A+null%7D%5D%2C+%22canon_url%22%3A+%22https%3A%2F%2Fbitbucket.org%22%2C+%22user%22%3A+%22arunoda%22%7D';

	var resp = bitbucket.checkForDeploy(repositoryConfig, payload);
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
