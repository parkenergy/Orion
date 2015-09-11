var needle = require('needle');
var async = require('async');
var Part = require('../../models/part.js');
var exec = require('child_process').exec,
  child;

var url = 'http://orion.parkenergyservices.com/api/parts';

function getParts(callback){
  var self = this;
  var partArray = [];
  needle.get(url, function(err, data){
    if(err){return callback(err);}
    if(!err && data.statusCode !== 200){
      var e = new Error('Error occurred while attempting to pull data');
      return callback(e);
    }
    else{
      //console.log(data.body);
      partArray = Object.keys(data.body).map(function(_id){
        return data.body[_id];
      });
    }
    async.eachSeries(partArray, upsertParts, function(err){
      if(err){ return callback(err); }
      Part.find({}, function(err,data){
        return callback(err,data);
      });
    });
  });
}


function upsertParts(part, callback) {
  delete part._id;
  delete part.__v;
  Part.findOneAndUpdate(
    {netsuiteId: part.netsuiteId},
    part,
    { upsert: true, new: true }
  ).exec(callback);
}

module.exports = getParts;
