Nariya
======
Simple [Continuous Deployment](http://www.avc.com/a_vc/2011/02/continuous-deployment.html) Server

Nariya is a Continuous Deployment Server written in node.js and Design for easy of use. Currently It supports Github based deployments. 

<b>Great for NodeJS project but designed to be work with any project</b>

Currently Nariya supports Github based projects only. (But can be added others easlily)

How It Works
------------

* First you add your Github based project to Nariya (its very easy)
* You'll get an unique web url 
* Then you've to configure above as an Github Service Hook (webhook)
* After that when you did a commit following happens
* Nariya will get the updates codebase to the server from github
* Then if it is an NodeJS project it will `npm install`
* After if your projet folder has `pre.sh` file it will be executed
* Then If your node project has `start*.js` file Nariya will start that script with forever eg:- `start-app.js`, `startApp.js`
* Then it will look for `post.sh` and execute if exists
* You will get an email notification once this completed (look for configurations)

Install
-------

	sudo npm install forever -g
	sudo npm install nariya -g

Usage
-------

* Start the Server - `nariya start`
* Visit your github based project and add it - `nariya add <project name>`
* You'll be shown an url
* Then add the url you generated as an Github Service Hook<br>
	eg:- https://github.com/arunoda/nariya/admin/hooks
* That's all. Push some commit to master branch ans see for your self
* Add any number of projects you want

Configurations
--------------

* Nariya create an folder called `.nariya` on your home folder 
* It contains `nariya.conf` file where you can add and edit project
* Also it contains log files for both nariya it self and projects as well
* In order work email notification correctly. You've to edit the `nariya.conf`
* Most of the configurations for the app is auto generated when adding. You can config via `nariya.conf`. Such as custom logpath, branch to get pulls

