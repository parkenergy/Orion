
var needle = require('needle');
var async = require('async');
var log = require('../../helpers/logger');
var PmReport = require('../../models/pmReport');
var exec = require('child_process').exec,
    child;

var pmReportSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=customrecord_fieldworkorder&id=209';
var options = {
  headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion~2017~',
    'User-Agent' : 'SuiteScript-Call',
    'Content-Type' : 'application/json'
  }
  
};

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
    unitNumber: ele.columns.custrecord_wo_asset_number.name,
    unitType: ele.columns.custrecord_comptype.name,
    unitTypeNSID: ele.columns.custrecord_comptype.internalid,
    customer: ele.columns.custrecord_customer_name.name,
    leaseName: ele.columns.custrecord_lease_name,
    nextPmDate: ele.columns.formuladate,
    userId: ele.columns.custrecord_techid.name,
    
    created: ele.columns.created,
    cycleTime: ele.columns.hasOwnProperty('custrecord_pmcycletime')? ele.columns.custrecord_pmcycletime.name : '',
    
    //netsuiteId: ele.id,
    updatedAt: Date.now()
  };
  
  // Remove this logic when PM reports is fixed on Netsuite !! ** !! ** --
  var incomingDate = new Date(pmReport.nextPmDate);
  
  PmReport.findOne({unitNumber: pmReport.unitNumber}, function (err, pmr) {
    if(err) return callback(err);
    
    if(pmr !== null){
      if(pmr.nextPmDate.getTime() < incomingDate.getTime()){
        // Update Existing PmReport if incoming nextPMDate is greater.
        PmReport.findOneAndUpdate({unitNumber: pmReport.unitNumber},
          pmReport,
          {upsert: true, new: true}
        ).exec(callback);
      } else {
        // return existing PmReport if incoming has older nextPmDate
        PmReport.findOne({unitNumber: pmReport.unitNumber}).exec(callback);
      }
    } else {
      // insert incoming PmReport if it doesn't exist.
      PmReport.update({unitNumber: pmReport.unitNumber}, pmReport, {upsert: true, new: true}).exec(callback);
    }
  });
  // ---------------------------------------------------------------------
  
  
  /*PmReport.findOneAndUpdate(
    { netsuiteId: pmReport.netsuiteId }, pmReport,
    { upsert: true, new: true, safe: false }
  ).exec(callback);*/
  
}

module.exports = getPmReports;
