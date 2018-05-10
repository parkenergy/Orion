const mongoose = require('mongoose'),
  config = require('../config');

before(function (done) {
  mongoose.connect(config.mongodb);
  mongoose.connection.on('connected', done);
});

require('./unit');
require('./integration');
