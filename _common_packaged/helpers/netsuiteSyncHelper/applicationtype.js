var needle = require('needle');
var async = require('async');
var ApplicationType = require('../../models/applicationtype.js');
var exec = require('child_process').exec,
  child;

var applicationtypeListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=92&deploy=1&listid=customlist_applicationtype';
var options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=Netsuite01',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

function getApplicationTypes(callback) {
  needle.get(applicationtypeListUrl, options, function(err, data){
    if(err){return err;}
    async.eachSeries(data.body, applicationtypeFormat, function (err) {
      if(err){return callback(err);}
      ApplicationType.find({}, function (err, data) {
        return callback(err, data);
      });
    });
  });
}

function applicationtypeFormat (ele, callback){
  list = ele.split(', ');
  var applicationtype = {
    type: list[0],
    netsuiteId: list[1]
  }
  ApplicationType.findOneAndUpdate(
    { netsuiteId: applicationtype.netsuiteId },
    applicationtype,
    { upsert: true, new: true }
  ).exec(callback);
}

module.exports = getApplicationTypes;
