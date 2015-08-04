
var loadUnits = require('./unit.js')
var loadCustomers = require('./customer.js')
var loadUsers = require('./user.js')
var async = require('async')

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


}

importHelper.prototype.execute = function (callback) {
  console.log('Executing loads');
  var self = this;

  async.series([

    function (cb) {
      console.log('Load Customers');
      loadCustomers(function (err, data) {
        self.customers = data;
        console.log(self.customers);
        return cb(err, data);
      });
    },

    function (cb) {
      console.log('Load Users');
      loadUsers(function (err, data) {
        self.users = data;
        console.log(self.users);
        return cb(err, data);
      });
    },

    function (cb) {
      console.log(' Load Units');
      loadUnits(function (err, data) {
        self.units = data;
        console.log(self.units);
        return cb(err, data);
      });
    },
    //
    // function (cb) {
    //   console.log('Load Parts');
    //   loadParts(function (err, data) {
    //     self.parts = data;
    //     return cb(err, data);
    //   });
    // },

  ], function (err) {
    return callback(err);
  });

};

module.exports = importHelper;
