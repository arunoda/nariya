var GithubRepository = require('./github');
var BitbucketRepository = require('./bitbucket');

module.exports = {
	"github": new GithubRepository(),
	"bitbucket": new BitbucketRepository()
};