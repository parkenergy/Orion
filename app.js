
/* Initialize an Express.js application
----------------------------------------------------------------------------- */
var express = require('express');
var app = express();
    app.set('port', process.env.PORT || 3000);
    app.set('view engine', 'ejs');

/* Configure middleware for the  application
----------------------------------------------------------------------------- */
    app.use(express.static(require('path').join(__dirname, '/public'))); //Expose public files
    app.use(require('compression')()); // gzip response data

/* Include the express routes
----------------------------------------------------------------------------- */
    require('./routes')(app); // Include the express routes

/* Configure the MongoDB database
----------------------------------------------------------------------------- */
var mongoose = require('mongoose');
var env = process.env.NODE_ENV || 'development';
switch (env) {
  case "production":
    throw new Error("No production database configured");
    break;
  case "development":
    mongoose.connect('mongodb://localhost/orion-dev');
    break;
  case "test":
    mongoose.connect('mongodb://localhost/orion-test');
    break;
  default:
    throw new Error('Orion is not configured for "' + env + '" environment');
    break;
}

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {

  /* Start an Orion server instance
  --------------------------------------------------------------------------- */
  var server = app.listen(3000, function () {
    var port = server.address().port;
    var host = server.address().address === "::" ?
                "localhost" :
                server.address().address;

    var Log = require('./helpers/log.js');
    var log = new Log(db);
    log.initialize();

    console.log('Orion server listening at http://' + host + ':' + port);
    console.log('Orion server running in ' + env + ' environment');

  });

});
