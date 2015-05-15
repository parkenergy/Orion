
/* Initialize an Express.js application
----------------------------------------------------------------------------- */
var app = require('express')();
    app.set('port', process.env.PORT || 3000);
    app.set('view engine', 'ejs');

/* Configure middleware for the  application
----------------------------------------------------------------------------- */
    app.use(express.static(path.join(__dirname, '/public'))); //Expose public files
    app.use(require('compression')()); // gzip response data

/* Include the express routes
----------------------------------------------------------------------------- */
    require('./routes')(app); // Include the express routes

/* Configure the MongoDB database
----------------------------------------------------------------------------- */
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

/* Start an Orion server instance
----------------------------------------------------------------------------- */
var server = http.createServer(app);
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});


var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Orion server listening at http://%s:%s', host, port);
  console.log('Orion server running in ' + env + ' environment');

});
