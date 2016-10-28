var mongoose = require('mongoose');
var config = require('../../config');
var Promise = require('bluebird');

before(function (done) {
  mongoose.Promise = Promise;
  mongoose.connect(config.mongodb);
  mongoose.connection.on('connected', done);
});
