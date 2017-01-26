
var loadUnits = require('./unit.js');
var loadCustomers = require('./customer.js');
var loadUsers = require('./user.js');
var loadParts = require('./part.js');
var loadPmReports = require('./pmReport');
var loadApplicationTypes = require('./applicationtype.js');
var loadLocations = require('./location.js');
var log = require('../../helpers/logger');
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
  this.pmreports = null;
};

importHelper.prototype.execute = function (callback) {
  var self = this;
  log.trace("Netsuite tasks started");
  async.parallel([

    function (cb) {
      loadCustomers(function (err, data) {
        log.trace("Load Customers");
        self.customers = data;
        return cb(err, data);
      });
    },

    function (cb) {
      loadUsers(function (err, data) {
        log.trace("Load Users");
        self.users = data;
        return cb(err, data);
      });
    },

    function (cb) {
      loadUnits(function (err, data) {
        log.trace("Load Units");
        self.units = data;
        return cb(err, data);

      });
    },

    function (cb) {
      loadParts(function (err, data) {
        log.trace("Load Parts");
        self.parts = data;
        return cb(err, data);
      });
    },

    function (cb) {
      loadApplicationTypes(function (err, data) {
        log.trace("Load Application Types");
        self.applicationtypes = data;
        return cb(err, data);
      });
    },

    function (cb){
      loadLocations(function (err,data){
        log.trace("Load Locations");
        self.locations = data;
        return cb(err,data);
      });
    }/*,
    
    function (cb) {
      loadPmReports(function (err, data) {
        log.trace("Load PmReports");
        self.pmreports = data;
        return cb(err,data);
      })
    }*/
    
  ], function (err) {
    if(err) log.debug({error: err}, "Error Occured?");
    log.trace("Netsuite Task Finished");
    return callback(err);
  });

};

module.exports = importHelper;
