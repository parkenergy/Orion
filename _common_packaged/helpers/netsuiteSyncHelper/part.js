
var needle = require('needle');
var async = require('async');
var Part = require('../../models/part.js');
var exec = require('child_process').exec,
    child;

var partSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=item&id=90';
var options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=Netsuite01',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

function getParts(callback) {
  needle.get(partSearchUrl, options, function(err,data){
    if (err){ return err; }
    var partsArray = Object.keys(data.body).map(function(id) { // turn json into array
      return data.body[id];
    });
    async.eachSeries(partsArray, partFormat, function (err) {
      if (err) { return callback(err); }
      Part.find({}, function (err, data) {
        return callback(err, data);
      });
    });
  });
}

function partFormat (ele, callback) {
  var part = {
      netsuiteId: ele.id,
      description: ele.columns.salesdescription,
      componentName: ele.columns.itemid,
  };
  Part.findOneAndUpdate(
    { netSuiteId : part.netsuiteId },
    part,
    { upsert: true, new: true } // insert the document if it does not exist
  ).exec(callback);
}


module.exports = getParts;
