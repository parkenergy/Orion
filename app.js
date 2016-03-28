
/* Initialize an Express.js application
----------------------------------------------------------------------------- */
var globals = require('./lib/GLOBALS.js');
var express = require('express');
var passport = require('passport');
var Agenda = require('agenda');
var importHelper = require('./lib/helpers/netsuiteSyncHelper');
var importer = new importHelper();
var app = express();
    app.set('port', process.env.PORT || 3000);
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/lib/views/');

/* Configure middleware for the  application
----------------------------------------------------------------------------- */
    app.use(require('serve-favicon')(__dirname + '/lib/public/images/favicon.ico'));
    app.use(require('body-parser')());
    app.use(require('cookie-parser')());

    // Session has to be included prior to Passport and after cookies.
    app.use(require('express-session')({secret: 'oneTimeAtBandCamp'}));

    // Passport has to be included prior to the routes
    app.use(passport.initialize());
    app.use(passport.session());

/* Include the express routes
----------------------------------------------------------------------------- */
    require('./routes')(app); // Include the express routes

/* Finish Configuring middleware for the  application
----------------------------------------------------------------------------- */
    app.use((express.static(require('path').join(__dirname, '/public'))));
    app.use('/lib/public', (express.static(require('path').join(__dirname, '/lib/public'))));
    app.use(require('compression')()); // gzip response data
    app.use(require('method-override'));
    app.use(require('errorhandler'));

/* Configure the MongoDB database
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }
};
var uri = "";
var env = process.env.NODE_ENV || 'development';
switch (env) {
  case "production":
    console.log("Connecting to production database");
    uri = uriUtil.formatMongoose(globals.dbConnectionUrls.production);
    mongoose.connect(uri, options);
    break;
  case "staging":
    console.log("Connecting to staging database");
    uri = uriUtil.formatMongoose(globals.dbConnectionUrls.staging);
    mongoose.connect(uri, options);
    break;
  case "client":
    mongoose.connect(globals.dbConnectionUrls.client);
    break;
  case "development":
    console.log("Connecting to development database");
    mongoose.connect(globals.dbConnectionUrls.development);
    break;
  case "test":
    mongoose.connect(globals.dbConnectionUrls.test);
    break;
  default:
    throw new Error('Orion is not configured for "' + env + '" environment');
}

var db = mongoose.connection;
console.log(uri);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {

  /* Start an Orion server instance
  --------------------------------------------------------------------------- */
  var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    var host = server.address().address === "::" ?
                "localhost" :
                server.address().address;


    var agenda = new Agenda({db: {address: uri}});

    agenda.define('netsuiteSync', function(job, done){
      console.log("Netsuite import...");
      importer.execute(done);
    });

    agenda.on('ready', function(){
      agenda.every('5 minutes', 'netsuiteSync');
      agenda.start();
    });

    // sync.define('netsuiteSync', function(job, done) {
    //   console.log('Syncing with Netsuite');
    //   importer.execute(done);
    // });
    // sync.every('5 minutes', 'netsuiteSync');
    //
    // sync.start();

    console.log('Orion server listening at http://' + host + ':' + port);
    console.log('Orion server running in ' + env + ' environment');

    console.log("Initial netsuite import(startup)");
    importer.execute(done);
  });
});
