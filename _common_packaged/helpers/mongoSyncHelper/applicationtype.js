var needle = require('needle');
var async = require('async');
var ApplicationType = require('../../models/applicationtype.js');
var exec = require('child_process').exec,
  child;

var url = 'http://orion.parkenergyservices.com/api/applicationtypes';

function getApplicationTypes(callback){
  var self = this;
  var applicationtypeArray = [];
  needle.get(url, function(err, data){
    if(err){return callback(err);}
    if(!err && data.statusCode !== 200){
      var e = new Error('Error occurred while attempting to pull data');
      return callback(e);
    }
    else{
      //console.log(data.body);
      applicationtypeArray = Object.keys(data.body).map(function(_id){
        return data.body[_id];
      });
    }
    async.eachSeries(applicationtypeArray, upsertAppTypes, function(err){
      if(err){ return callback(err); }
      ApplicationType.find({}, function(err,data){
        return callback(err,data);
      });
    });
  });
}


function upsertAppTypes(applicationtype, callback) {
  delete applicationtype._id;
  delete applicationtype.__v;
  ApplicationType.findOneAndUpdate(
    {netsuiteId: applicationtype.netsuiteId},
    applicationtype,
    { upsert: true, new: true }
  ).exec(callback);
}

module.exports = getApplicationTypes;
