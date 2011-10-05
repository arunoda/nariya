Nariya
======
Continuous Deploymentor for NodeJS

Nariya is powered by Git and Web Hooks. Nariya gets updates for the project using `git pull master`
And a valid nariya project should have followings

* `package.json` file
* `start.js` - which should inititate the application
* `start.js` should takes whateever the port required to starts the app using arguments
   eg:- if the app required 2 ports
		node start.js 8090 8091

Install
-------

	sudo npm install nariya -g

Usage
-----

* Visit to the project folder (git enabled)
* If your project only required one port and we need two workers

	`nariya --api 8000 -p 8081 -p 8082`

Trigger Update
--------------

* As in the above example nariya's api runs on port `8000`
* If you need to trigger the deployment send an HTTP request

	`curl http://localhost:8000/update -X POST`
* This always start new app by port by port. If you have 3 workers running with the every deployment you always have 2 workers running everytime

Logs
----

Logs available at the following folder

	$HOME/.nariya/$APPNAME/logs/$PORT.log

* $HOME - home folder of the machine
* $APPNAME - appname retrieved from the `package.json`
* $PORT - port where worker is running

Temporary App Folder
--------------------

Tempory apps are copied to following folder

	$HOME/.nariya/$APPNAME/apps

Email Notificator
-----------------

### Config File

Following configuration should stored in `email.json` file at the root folder

	{
		"smtp": {
			"host": "smtp.gmail.com",
			"port": 587,
			"ssl": false,
			"use_authentication": true,
			"user": "admin@dfdsdf.com",
			"pass": "sdfdsfsd"
		},

		"me": {
			"name": "Arunoda Susiripala",
			"email": "admin@dfdsdf.com"
		},

		"receivers": [
			"df.sdsd@gmail.com"
		]
	}



