
var needle = require('needle');
var async = require('async');
var log = require('../../helpers/logger');
var PmReport = require('../../models/pmReport');
var exec = require('child_process').exec,
    child;

/*var pmReportSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=employee&id=97';
var options = {
  headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy~2016',
    'User-Agent' : 'SuiteScript-Call',
    'Content-Type' : 'application/json'
  }
  
};*/

function getPmReports(callback) {
  needle.get(pmReportSearchUrl, options, function (err,data){
    if (err) return callback(err);
    
    PmReport.remove({}).exec(function (err) {
      if (err) return callback(err);
      
      var pmReportArray = Object.keys(data.body).map(function (id) { // turn json into array
        return data.body[id];
      });
      async.eachSeries(pmReportArray, pmReportFormat, function (err) {
        if (err) { return callback(err); }
        PmReport.find({}, function (err, data) {
          return callback(err, data);
        });
      });
    });
  });
}

function pmReportFormat (ele, callback) {
  var pmReport = {
    unitNumber: ele.columns.unitNumber,
    unitType: ele.columns.unitType,
    customer: ele.columns.customer,
    leaseName: ele.columns.leaseName,
    nextPmDate: ele.columns.nextPmDate,
    userId: ele.columns.userId,
    
    netsuiteId: ele.id,
    updatedAt: Date.now()
  };
  
  PmReport.findOneAndUpdate(
    { netsuiteId: pmReport.netsuiteId },
    { upsert: true, new: true, safe: false }
  ).exec(callback);
  
}

//module.exports = getPmReports;
