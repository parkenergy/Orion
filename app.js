'use strict';

var express = require('express'),
  config = require('./config.js'),
  path = require('path'),
  fs = require('fs'),
  Agenda = require('agenda'),
  log = require('./lib/helpers/logger'),
  sessions = require('client-sessions'),
  Promise = require('bluebird'),
  mongoose = require('mongoose');


//Catch uncaught exceptions to log in bunyan
process.on('uncaughtException', function(err) {
  log.fatal({
    stack: err.stack || null,
    code: err.code ||null
  }, err.message || err);

  //DO NOT CONTINUE EXECUTION. Process could be in undefined state, safer to exit.
  process.exit(1); //Uncaught exception exit code
});

//plugin bluebird as promise provider
mongoose.Promise = Promise;

//start mongoose
log.info({uri: config.mongodb}, 'Connecting to MongoDB[Mongoose]');
mongoose.connect(config.mongodb);

//Init Express
var app = express();

log.info({path: path.resolve(config.viewsPath)}, 'Setup views path');
app.set('view engine', 'ejs');
app.set('views', path.resolve(config.viewsPath));
app.use(express.static(path.join(__dirname, '/public')));
app.use('/lib/public', express.static(path.join(__dirname, '/lib/public')));

//Serve SAP(index.ejs)
app.get('/', function(req, res) {
  var model = { appName: "Orion", title: "Orion" };
  res.render('index', model);
});

//Standard middleware
log.info("Load standard middleware");
app.use(require('cookie-parser')());
app.use(require('body-parser').json());
//app.use(require('express-query-boolean')());
app.use(sessions({
  cookieName: 'Orion', // cookie name dictates the key name added to the request object
  secret: '?wG!6C5/gn@6&W{U+]Rn>B#9/p.ku&*{x~XCjfw+E)q56Hxr', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));
//log.middleware(app);


//Load custom middleware
log.info({path: path.join(__dirname, '/lib/middleware')}, 'Load middleware from path');
loader(path.join(__dirname, '/lib/middleware'));

//Load routes
log.info({path: path.join(__dirname, '/lib/routes')}, 'Load routes from path');
loader(path.join(__dirname, '/lib/routes'));

//Scheduled tasks
var netsuiteSync = require('./lib/tasks/netsuiteSync');
var syncTask = new netsuiteSync();

var agenda = new Agenda({db: {address: config.mongodb}});

agenda.define('netsuiteSync', function(job, done){
  log.info("Netsuite import...");
  syncTask.execute(done);
});

agenda.on('ready', function(){
  agenda.every('5 minutes', 'netsuiteSync');
  agenda.start();
});

log.info("Initial Netsuite import...");
syncTask.execute(function() {
  log.info("...Netsuite import finished");
});

//Listen
log.info("Starting app...");

app.listen(process.env.PORT || config.port, function() {
  log.info({port: process.env.PORT || config.port},"App started");
});

//Loader helper
function loader(dir) {
  dir = path.resolve(dir);

  fs.readdirSync(dir)
    .forEach(function(fileName) {
      var modulePath = path.join(dir, fileName);
      log.info({path: modulePath, file: __filename, fn: "#loader()"}, "Load module");
      require(modulePath)(app);
    });
}
