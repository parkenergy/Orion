
const loadUnits             = require('./unit.js'),
      loadCustomers         = require('./customer.js'),
      loadUsers             = require('./user.js'),
      loadParts             = require('./part.js'),
      loadApplicationTypes  = require('./applicationtype.js'),
      loadAssetTypes        = require('./assetType'),
      loadVendors           = require('./vendor'),
      loadLocations         = require('./location.js'),
      log                   = require('../../helpers/logger'),
      async                 = require('async');

const importHelper = function () {

  /* Loaded locally
  --------------------------------------------------------------------------- */
  this.counties = null; // just load local
  this.states = null; // just load local


  /* Loaded from NS
  --------------------------------------------------------------------------- */
  this.customers = null;
  this.vendors = null;
  this.parts = null;
  this.units = null;
  this.users = null;
  this.applicationtypes = null;
  this.assetType = null;
  this.locations = null;
  this.pmreports = null;
};

importHelper.prototype.execute = function (callback) {
  const self = this;
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
      loadVendors(function (err, data) {
        log.trace("Load Vendors");
        self.vendors = data;
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

    function (cb) {
      loadAssetTypes(function (err, data) {
        log.trace("Load Asset Types");
        self.assetType = data;
        return cb(err, data);
      })
    },

    function (cb){
      loadLocations(function (err,data){
        log.trace("Load Locations");
        self.locations = data;
        return cb(err,data);
      });
    }

  ], function (err) {
    if(err) log.debug({error: err}, "Error Occured?");
    log.trace("Netsuite Task Finished");
    return callback(err);
  });

};

module.exports = importHelper;
