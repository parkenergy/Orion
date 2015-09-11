
var loadUnits = require('./unit.js');
var loadCustomers = require('./customer.js');
var loadUsers = require('./user.js');
var loadParts = require('./part.js');
var loadApplicationTypes = require('./applicationtype.js');
var loadLocations = require('./location.js');
var async = require('async');

var importHelper = function () {

  /* Loaded locally
  --------------------------------------------------------------------------- */
  this.counties = null; // just load local
  this.states = null; // just load local


  /* Loaded from NS
  --------------------------------------------------------------------------- */
  this.customers = null;
  this.parts = null;
  this.units = null;
  this.users = null;
  this.applicationtypes = null;
  this.locations = null;
};

importHelper.prototype.execute = function (callback) {
  var self = this;

  async.series([

    function (cb) {
      loadCustomers(function (err, data) {
        self.customers = data;
        return cb(err, data);
      });
    },

    function (cb) {
      loadUsers(function (err, data) {
        self.users = data;
        return cb(err, data);
      });
    },

    function (cb) {
      loadUnits(function (err, data) {
        self.units = data;
        return cb(err, data);

      });
    },

    function (cb) {
      loadParts(function (err, data) {
        self.parts = data;
        return cb(err, data);
      });
    },

    function (cb) {
      loadApplicationTypes(function (err, data) {
        self.applicationtypes = data;
        return cb(err, data);
      });
    },

    function (cb){
      loadLocations(function(err,data){
        self.locations = data;
        return cb(err,data);
      });
    },
    
  ], function (err) {
    return callback(err);
  });

};

module.exports = importHelper;
