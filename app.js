'use strict';

var express = require('express'),
  config = require('./config.js'),
  path = require('path'),
  fs = require('fs'),
  Agenda = require('agenda'),
  log = require('./lib/helpers/logger'),
  sessions = require('client-sessions'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  jwt = require('jwt-simple'),
  colors = require('colors');

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
app.use(sessions({
  cookieName: 'Orion', // cookie name dictates the key name added to the request object
  secret: '?wG!6C5/gn@6&W{U+]Rn>B#9/p.ku&*{x~XCjfw+E)q56Hxr', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));
log.middleware(app);

if(config.requestLogger) app.use(require('morgan')(config.requestLogger));

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

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.header('Authorization')) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.header('Authorization').split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user = payload.sub;
  next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

/*
 |--------------------------------------------------------------------------
 | GET /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/me', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    res.send(user);
  });
});

/*
 |--------------------------------------------------------------------------
 | PUT /api/me
 |--------------------------------------------------------------------------
 */
app.put('/api/me', ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.displayName = req.body.displayName || user.displayName;
    user.email = req.body.email || user.email;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Login with Google
 |--------------------------------------------------------------------------
 */
app.post('/auth/google', function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.GOOGLE_SECRET,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
      if (profile.error) {
        return res.status(500).send({message: profile.error.message});
      }
      // Step 3a. Link user accounts.
      if (req.header('Authorization')) {
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
          }
          var token = req.header('Authorization').split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.google = profile.sub;
            user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
            user.displayName = user.displayName || profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ google: profile.sub }, function(err, existingUser) {
          if (existingUser) {
            return res.send({ token: createJWT(existingUser) });
          }
        })
      }
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Unlink Provider
 |--------------------------------------------------------------------------
 */
app.post('/auth/unlink', ensureAuthenticated, function(req, res) {
  var provider = req.body.provider;
  var providers = ['facebook', 'foursquare', 'google', 'github', 'instagram',
    'linkedin', 'live', 'twitter', 'twitch', 'yahoo'];

  if (providers.indexOf(provider) === -1) {
    return res.status(400).send({ message: 'Unknown OAuth Provider' });
  }

  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User Not Found' });
    }
    user[provider] = undefined;
    user.save(function() {
      res.status(200).end();
    });
  });
});
