const mongoose = require('mongoose'),
  config = require('../config'),
  Promise = require('bluebird');

before(function (done) {
  mongoose.Promise = Promise;
  mongoose.connect(config.mongodb);
  mongoose.connection.on('connected', done);
});

require('./unit');
require('./integration');
