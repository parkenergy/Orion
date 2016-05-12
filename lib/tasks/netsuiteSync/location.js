var needle = require('needle');
var async = require('async');
var Location = require('../../models/location.js');
var exec = require('child_process').exec,
  child;

var locationSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=location&id=100';

var options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy~',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

function getLocations(callback){
  needle.get(locationSearchUrl, options, function (err,data){
    if(err) return err;
    var locationArray = Object.keys(data.body).map(function (id){
      return data.body[id];
    });
    async.eachSeries(locationArray, locationFormat, function (err){
      if(err) return callback(err);
      Location.find({}, function (err,data){
        return callback(err,data);
      });
    });
  });
}

function locationFormat(ele, callback){
  try {
    var location = {
      netsuiteId: ele.id,
      name: ele.columns.name
    };
    Location.findOneAndUpdate(
      {netsuiteId: location.netsuiteId},
      location,
      {upsert: true, new: true}
    ).exec(callback);
  }
  catch (e){
    callback(e);
  }
}

module.exports = getLocations;
