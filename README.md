# Orion

### NAVIGATION

- [Tests](#markdown-header-tests)

    - [Mocha: Server Side Testing](#markdown-header-mocha-server-side-testing)

    - [Protractor: End-to-End Testing](#markdown-header-protractor-end-to-end-testing)

- [Development](#markdown-header-development)

- [Production](#markdown-header-production)

- [Specifications](#markdown-header-specifications)

- [API](#markdown-header-api)

### Useful Links

[git submodules](http://stackoverflow.com/a/14259250)

[node api](http://nodejs.org/api/)

[express api](http://expressjs.com/4x/api.html)

[express 4.x Changes](https://github.com/visionmedia/express/wiki/Migrating-from-3.x-to-4.x)

[angular api](https://docs.angularjs.org/api)

[sequelize docs](http://sequelizejs.com/docs/1.7.8/installation)

[mocha](http://visionmedia.github.io/mocha/)

[protractor](https://github.com/angular/protractor/blob/master/docs/toc.md)

[mysql](http://dev.mysql.com/doc/refman/5.0/en/macosx-installation.html)

[mysql workbench](http://dev.mysql.com/get/Downloads/MySQLGUITools/mysql-workbench-community-6.1.7-osx-i686.dmg)

[markdown](https://bitbucket.org/tutorials/markdowndemo/overview#markdown-header-links)

### Videos, Tutorials, and Introductions

[codeschool: node.js](https://www.codeschool.com/courses/real-time-web-with-node-js)

[angular introduction](https://www.youtube.com/watch?v=WuiHuZq_cg4)

[angular deep dive](https://www.youtube.com/watch?v=Lx7ycjC8qjE&list=PLP6DbQBkn9ymGQh2qpk9ImLHdSH5T7yw7)

[HTML5](http://www.youtube.com/watch?v=WxmcDoAxdoY)


# Initial Setup

#### Homebrew

install [homebrew](http://brew.sh)

#### node.js

install node.js by typing the following command into your terminal

    brew install node

after you've done this, I highly recommend permanently setting the following
default variable in your .bash_profile file

    export NODE_ENV=development

#### Mongo DB

install MongoDB by typing the following command into your terminal

    brew install mongodb

setup MongoDB ([guide](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/#run-mongodb))
 by opening a terminal window and entering the following commands sequentially:

    sudo mkdir -p /data/db

    sudo mongod

    ctrl+c

now you *should* be able to run the following command in terminal without super
user permissions (you can always exit an active mongo terminal with ctrl+c)

    mongod

potential issues with mongo setup

  1. cannot close a running mongod thread (address already in use)
  [stack overflow](http://stackoverflow.com/a/26152629)

  2. can only run mongo as super user
  [stack overflow](http://stackoverflow.com/a/5301416)

#### Project Source Code and Config

pull this repo

    git pull git@github.com:parkenergy/Orion.git

run npm install (this will also install all of the dev dependencies)

    npm install


# Running the Server

start the mongo database by typing the following command into your terminal

    mongod

start the Orion server by typing the following command into a different tab

    npm start


# Tests

Testing an enterprise level app like this is important. It can help ensure that
changes introduced into production code behaving according to spec. It will also
help to ensure that future developers understand the intended project behavior.

We use two separate testing frameworks in this project,
[mocha](http://visionmedia.github.io/mocha/)
and
[protractor](https://github.com/angular/protractor/blob/master/docs/toc.md).

## Mocha: Server Side Testing

Mocha is a testing framework that we will be employing on the server side.
Primarily, we will be using mocha to test data-models and route-controllers.

## Protractor: End-to-End Testing

We are aiming for near-complete testing on the front end.
Since the functionality of the angular app is complex and user behavior is
difficult to anticipate due to the high level of possible choices and decisions,
testing is going to safeguard against unexpected malfunctions in the software.
For this reason, we need to ensure that the front-end is properly validating,
screening, and preventing invalid data from reaching the server where it would
be rejected by the API.

API spec should not change once the app is live.

Protractor relies on having a Selenium server running.
By default, it will run at
[http://localhost:4444/wd/hub](http://localhost:4444/wd/hub)

To start the Selenium server, run the following CLI command.

    webdriver-manager start

This will output a large number of logs to the command line. You should now have
a Selenium server running. Check the address listed above to verify that it's
running. [link for the lazy](http://localhost:4444/wd/hub)

You are now ready to run protractor.

If you have not already started your node server, do so now (remember to set
your node server's environment variable to development).

    npm start
