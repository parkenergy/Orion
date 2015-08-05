
/* Initialize an Express.js application
----------------------------------------------------------------------------- */
var globals = require('./_common_packaged/GLOBALS.js');
var express = require('express');
var Agenda = require('agenda');
var importHelper = require('./_common_packaged/helpers/netsuiteSyncHelper');
var importer = new importHelper();
var app = express();
    app.set('port', process.env.PORT || 3000);
    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/_common_packaged/views/');

/* Configure middleware for the  application
----------------------------------------------------------------------------- */
    app.use(require('serve-favicon')(__dirname + '/_common_packaged/public/images/favicon.ico'));
    app.use(require('body-parser')());

/* Include the express routes
----------------------------------------------------------------------------- */
    require('./routes')(app); // Include the express routes

/* Finish Configuring middleware for the  application
----------------------------------------------------------------------------- */
    app.use((express.static(require('path').join(__dirname, '/public'))));
    app.use('/_common_packaged/public', (express.static(require('path').join(__dirname, '/_common_packaged/public'))));
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
    var dbString = db.host + ':' + db.port + '/' + db.name;
    console.log(dbString);
    var sync = new Agenda({db: {address: uri}});

    sync.define('sync', function(job, done) {
        console.log('Starting Sync');
        importer.execute(done);
        res.send(200, "OK");
      });


      sync.every('5 minutes', 'sync');

      sync.start();

    var Log = require('./_common_packaged/helpers/log.js');
    var log = new Log(db);
    log.initialize();

    console.log('Orion server listening at http://' + host + ':' + port);
    console.log('Orion server running in ' + env + ' environment');

    if(env === 'development' && false) { // change to true to load data
      var DataLoader = require('./_common_packaged/_dev_util/dataload');
      var dataload = new DataLoader();
    }



  });

});
