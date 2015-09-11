var async = require('async');
var pullUnits = require('./unit.js');
var pullUsers = require('./user.js');
var pullCustomers = require('./customer.js');
var pullParts = require('./part.js');
var pullApplicationTypes = require('./applicationtype.js');
var pushWorkorders = require('./workorder.js');

var mongoSyncHelper = function(){
  this.units = null;
  this.users = null;
  this.customers = null;
  this.parts = null;
  this.applicationtypes = null;
};

mongoSyncHelper.prototype.execute = function(callback){
  console.log('Pulling From Master');
  var self = this;
  async.series([
    function(cb){
      pullUnits(function(err,data){
        self.units = data;
        return cb(err,data);
      });
    },
    function(cb){
      pullUsers(function(err,data){
        self.users = data;
        return cb(err,data);
      });
    },
    function(cb){
      pullCustomers(function(err,data){
        self.customers = data;
        return cb(err,data);
      });
    },
    function(cb){
      pullParts(function(err,data){
        self.parts = data;
        return cb(err,data);
      });
    },
    function(cb){
      pullApplicationTypes(function(err,data){
        self.applicationtypes = data;
        return cb(err,data);
      });
    },
    function(cb){
      pushWorkorders(function(err){
        console.log('almost done');
        return cb(err);
      });
    },
  ], function(err){
    return callback(err);
  });
};

module.exports = mongoSyncHelper;
