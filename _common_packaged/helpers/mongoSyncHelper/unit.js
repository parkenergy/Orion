var needle = require('needle');
var async = require('async');
var Unit = require('../../models/unit.js');
var exec = require('child_process').exec,
  child;

var url = 'http://orion.parkenergyservices.com/api/units';

function getUnits(callback){
  var self = this;
  var unitArray = [];
  needle.get(url, function(err, data){
    if(err){return callback(err);}
    if(!err && data.statusCode !== 200){
      var e = new Error('Error occurred while attempting to pull data');
      return callback(e);
    }
    else{
      //console.log(data.body);
      unitArray = Object.keys(data.body).map(function(_id){
        return data.body[_id];
      });
    }
    async.eachSeries(unitArray, upsertUnits, function(err){
      if(err){ return callback(err); }
      Unit.find({}, function(err,data){
        return callback(err,data);
      });
    });
  });
}


function upsertUnits(unit, callback) {
  delete unit._id;
  delete unit.__v;
  Unit.findOneAndUpdate(
    {netsuiteId: unit.netsuiteId},
    unit,
    { upsert: true, new: true }
  ).exec(callback);
}

module.exports = getUnits;
