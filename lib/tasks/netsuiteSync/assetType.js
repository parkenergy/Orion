var needle = require('needle');
var async = require('async');
var AssetType = require('../../models/assetType');
var exec = require('child_process').exec,
    child;

/*
*   Need url
* */

/*var assettypeListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=92&deploy=1&listid=customlist_assettype';
var options = {
  headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy~2016',
    'User-Agent' : 'SuiteScript-Call',
    'Content-Type' : 'asset/json'
  }
  
};*/

function getAssetTypes(callback) {
  needle.get(assettypeListUrl, options, function (err, data){
    if(err){return err;}
    async.eachSeries(data.body, assetTypeFormat, function (err) {
      if(err){return callback(err);}
      AssetType.find({}, function (err, data) {
        return callback(err, data);
      });
    });
  });
}

function assetTypeFormat (ele, callback){
  list = ele.split(', ');
  var assetType = {
    type: list[0],
    netsuiteId: list[1]
  };
  AssetType.findOneAndUpdate(
    { netsuiteId: assetType.netsuiteId },
    assetType,
    { upsert: true, new: true }
  ).exec(callback);
}

module.exports = getAssetTypes;
