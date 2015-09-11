var async = require('async');

var SyncHelperPull = require('./syncHelperPull.js');
var SyncHelperPush = require('./syncHelperPush.js');

var SyncHelper = function () {

  this.area = new SyncHelperPull("areas");
  this.county = new SyncHelperPull("counties");
  this.customer = new SyncHelperPull("customers");
  this.part = new SyncHelperPull("parts");
  this.state = new SyncHelperPull("states");
  this.unit = new SyncHelperPull("units");
  this.user = new SyncHelperPull("users");
  this.vendor = new SyncHelperPull("vendors");

  this.error = new SyncHelperPush("errors");
  this.transfer = new SyncHelperPush("transfers");
  this.workorder = new SyncHelperPush("workorders");

  // return {

    // getMostRecentlyUpdated: function (callback) {
    //   var self = this;
    //   async.series([
    //     function (cb) {
    //       area.getMostRecentlyUpdated(
    //         function (err, data) { return cb(err, data.updated_at); }
    //       );
    //     },
    //     function (cb) {
    //       county.getMostRecentlyUpdated(
    //         function (err, data) { return cb(err, data.updated_at); }
    //       );
    //     },
    //     function (cb) {
    //       customer.getMostRecentlyUpdated(
    //         function (err, data) { return cb(err, data.updated_at); }
    //       );
    //     },
    //     function (cb) {
    //       part.getMostRecentlyUpdated(
    //         function (err, data) { return cb(err, data.updated_at); }
    //       );
    //     },
    //     function (cb) {
    //       state.getMostRecentlyUpdated(
    //         function (err, data) { return cb(err, data.updated_at); }
    //       );
    //     },
    //     function (cb) {
    //       unit.getMostRecentlyUpdated(
    //         function (err, data) { return cb(err, data.updated_at); }
    //       );
    //     },
    //     function (cb) {
    //       user.getMostRecentlyUpdated(
    //         function (err, data) { return cb(err, data.updated_at); }
    //       );
    //     },
    //     function (cb) {
    //       vendor.getMostRecentlyUpdated(
    //         function (err, data) { return cb(err, data.updated_at); }
    //       );
    //     }
    //   ], function (err, results) {
    //     if (err) { return callback(err); }
    //     else { return callback(null, getLatestTime(results)); }
    //   });
    // },
    //
    // getPending: function (callback) {
    //   var self = this;
    //   async.series([
    //     function (cb) {
    //       error.getPending(
    //         function (err, data) { return cb(err, data.length); }
    //       );
    //     },
    //     function (cb) {
    //       transfer.getPending(
    //         function (err, data) { return cb(err, data.length); }
    //       );
    //     },
    //     function (cb) {
    //       workorder.getPending(
    //         function (err, data) { return cb(err, data.length); }
    //       );
    //     },
    //   ], function (err, results) {
    //     if (err) { return callback(err); }
    //     else {return callback(null, getTotalPending(results)); }
    //   });
    // }
  // };
};

SyncHelper.prototype.updateNow = function (callback) {
  console.log('Updating now');
  var self = this;
  async.series([
    console.log('Async'),
    // function (cb) {//   console.log('Updating');//   area.updateNow(cb);// },
    function (cb) { self.county.updateNow(cb); },
    function (cb) { customer.updateNow(cb); },
    function (cb) { error.updateNow(cb); },
    function (cb) { part.updateNow(cb); },
    function (cb) { state.updateNow(cb); },
    function (cb) { transfer.updateNow(cb); },
    function (cb) { unit.updateNow(cb); },
    function (cb) { user.updateNow(cb); },
    function (cb) { vendor.updateNow(cb); },
    function (cb) { workorder.updateNow(cb); },
  ],
  function (err) {
    return callback(err);
  });
};



function getLatestTime (arr) {
  arr.sort(function (a, b) {
    if (a.getTime() > b.getTime()) { return -1; }
    if (a.getTime() < b.getTime()) { return  1; }
    else { return 0; }
  });
  return arr[0];
}

function getTotalPending (arr) {
  return arr.reduce(function(a, b) { return a + b; });
}

module.exports = SyncHelper;
