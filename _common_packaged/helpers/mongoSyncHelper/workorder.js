var needle = require('needle');
var async = require('async');
var Workorder = require('../../models/workorder.js');
var exec = require('child_process').exec,
  child;

var url = 'http://orion.parkenergyservices.com/api/workorders';

function postWorkorders(callback, err){
  var self = this;
  var workorderArray = [];
  Workorder.find( {isSynced: false} , function(err, workorders){
    if(err) return callback(err);
    workorderArray = workorders;
  });
  needle.post(url, workorderArray, function(err, resp){
    if(err){ return callback(err);}
    if(!err && resp.statusCode !== 200){
      var e = new Error('Error occured while pushing workorders');
      return callback(e);
    }
  });
  for(i = 0; i < workorderArray.length; ++i){
    Workorder.findOneAndUpdate( {netsuiteId: workorderArray[i].netsuiteId },
      {isSynced: true});
  }
  callback(err);
}

module.exports = postWorkorders;
