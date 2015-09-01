/* Includes
----------------------------------------------------------------------------- */
var HookInstaller = require('./hookInstaller.js');
var hookInstaller = new HookInstaller();

/* Declaration -- This class wraps console events
----------------------------------------------------------------------------- */
var Log = function (db) {
  this.db = require('../models');
  this.env = process.env.NODE_ENV;
  this.logs = [];
  this.tables = [];
  this.warns = [];
  this.errors = [];
};

/* Functions
----------------------------------------------------------------------------- */
Log.prototype.initialize = function () {
  var self = this;

  hookInstaller.install_hook_to(console);

  console.hook('log', function(data, log) {
    if (self.env === 'development' || self.env === 'test') {
      log('dev_log: ', data);
    } else {
      self.logs.push(data);
    }
  });

  console.hook('warn', function(data, warn) {
    if (self.env === 'development' || self.env === 'test') {
      warn('dev_warn: ', data);
    } else if (self.env === 'staging') {
      warn('staging_warn: ', data);
      self.warns.push(data);
    } else {
      self.warns.push(data);
    }
  });

  console.hook('error', function(data, error) {
    var e;
    if (self.env === 'development' || self.env === 'test') {
      error('dev_error: ', data);
    } else if (self.env === 'staging') {
      error('staging_error: ', data);
      self.errors.push(data);
      e = new self.db.Error({ data: data });
      e.save(function (err, data) {
        if (err) return console.error(err); // seriously? This is bad!
      });
    } else {
      error('prod_error: ', data);
      self.errors.push(data);
      e = new self.db.Error({ data: data });
      e.save(function (err, data) {
        if (err) return console.error(err); // seriously? This is bad!
      });
    }
  });

};

/* Exports
----------------------------------------------------------------------------- */
module.exports = Log;
