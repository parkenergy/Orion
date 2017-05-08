'use strict';

const express  = require('express'),
  config       = require('./config.js'),
  path         = require('path'),
  fs           = require('fs'),
  Agenda       = require('agenda'),
  log          = require('./lib/helpers/logger'),
  sessions     = require('client-sessions'),
  Promise      = require('bluebird'),
  cookieParser = require('cookie-parser'),
  bodyParser   = require('body-parser'),
  mongoose     = require('mongoose');

//Catch uncaught exceptions to log in bunyan
process.on('uncaughtException', (err) => {
  log.fatal({
    stack: err.stack || null,
    code: err.code ||null
  }, err.message || err);

  //DO NOT CONTINUE EXECUTION. Process could be in undefined state, safer to exit.
  process.exit(1); //Uncaught exception exit code
});

//plugin bluebird as promise provider
mongoose.Promise = Promise;

//log environment
log.info({env: process.env.NODE_ENV}, 'Starting for environment');

//start mongoose
log.info({uri: config.mongodb}, 'Connecting to MongoDB[Mongoose]');
mongoose.connect(config.mongodb);

//Init Express
const app = express();

//CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

log.info({path: path.resolve(config.viewsPath)}, 'Setup views path');
app.set('view engine', 'ejs');
app.set('views', path.resolve(config.viewsPath));
app.use(express.static(path.join(__dirname, '/public')));
app.use('/lib/public', express.static(path.join(__dirname, '/lib/public')));

//Serve SPA(index.ejs)
app.get('/', (req, res) => {
  var model = { appName: "Orion", title: "Orion" };
  res.render('index', model);
});

//Standard middleware
log.info("Load standard middleware");
app.use(bodyParser.json({ type: '*/*'}));

app.use(cookieParser());
app.use(sessions({
  cookieName: 'identity', // cookie name dictates the key name added to the request object
  secret: '?wG!6C5/gn@6&W{U+]Rn>B#9/p.ku&*{x~XCjfw+E)q56Hxr', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));

//Load custom middleware
log.info({path: path.join(__dirname, '/lib/middleware')}, 'Load middleware from path');
loader(path.join(__dirname, '/lib/middleware'));

//Load routes
log.info({path: path.join(__dirname, '/lib/routes')}, 'Load routes from path');
loader(path.join(__dirname, '/lib/routes'));

//Scheduled tasks
const netsuiteSync = require('./lib/tasks/netsuiteSync'),
  syncTask         = new netsuiteSync(),
  agenda           = new Agenda({db: {address: config.mongodb}});

agenda.define('netsuiteSync', (job, done) => {
  log.info("Netsuite import...");
  syncTask.execute((err) => {
    if(err){
      log.error({error: err}, "Error occured during Netsuite Sync");
    }
    else {
      log.info("...Netsuite import finished");
    }
  });
  done();
});

agenda.on('ready', () => {
  agenda.every('5 minutes', 'netsuiteSync');
  agenda.start();
});

//Listen
log.info("Starting app...");

app.listen(process.env.PORT || config.port, () => {
  log.info({port: process.env.PORT || config.port},"App started");
});

//Loader helper
function loader(dir) {
  dir = path.resolve(dir);

  fs.readdirSync(dir)
    .forEach((fileName) => {
      var modulePath = path.join(dir, fileName);
      log.info({path: modulePath, file: __filename, fn: "#loader()"}, "Load module");
      require(modulePath)(app);
    });
}

// Gracefully shutdown
function graceful() {
  // cancel all netsuiteSync jobs.
  agenda.cancel({name: 'netsuiteSync'}, function (err,numberRemoved) {
    if(err) log.trace({err: err}, 'Error Shutting down netsuiteSync agenda job');
    log.trace({number: numberRemoved}, 'Number of netsuiteSync agenda jobs removed');
  });
  agenda.stop();
  // disconnect from database
  mongoose.connection.close();

  setTimeout(function () {
    process.exit(0);
  },300);

}
// Run Gracefull when ctrl+c or termination
process.on('SIGTERM',graceful);
process.on('SIGINT', graceful); // ctrl+c
