
var needle = require('needle');
var async = require('async');
var Customer = require('../../models/customer.js');
var exec = require('child_process').exec,
    child;

var customerSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=customer&id=64';
// var customerSearchUrl = urlTemplate + '&recordtype=customer&id=64';
var options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=Netsuite01',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

// function customerSearch (callback) {
//   console.log('Search Custoemrs');
//   needle.get('https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=customer&id=64', options, function (err,data) {
//     console.log('Found Customers');
//   });
// };
//
// function getCustomers (callback) {
//   console.log('Get Customers');
//   customerSearch(function (err, data) {
//     console.log('Found Customers');
//     if (err) { return callback(err); }
//     console.log('Found Customers');
//     customerArray = formatNetSuiteData(data);
//     async.eachSeries(customerArray, customerFormat, function (err) {
//       if (err) { return callback(err); }
//       Customer.find({}, function (err, data) {
//         return callback(err, data);
//       });
//     });
//   });
// }

function getCustomers(callback) {
  console.log('Get Customers');
  needle.get(customerSearchUrl, options, function(err,data){
    console.log('Needle Worked');
    if (err){ return err; }
    console.log('Format NetSuite');
    var customerArray = Object.keys(data.body).map(function(id) { // turn json into array
      return data.body[id];
    });
    async.eachSeries(customerArray, customerFormat, function (err) {
      if (err) { return callback(err); }
      Customer.find({}, function (err, data) {
        return callback(err, data);
      });
    });
  });
}

function formatNetSuiteData(data) {
  console.log('Format NetSuite');
  var customerArray = Object.keys(data.body).map(function(id) { // turn json into array
    return data.body[id];
  });
}

function customerFormat (ele, callback) {
  var customer = {
    shortname: ele.columns.entityid,
    name: ele.columns.altname,
    phone: ele.columns.phone,
    netsuiteId: ele.id,
    email: ele.columns.email,
    updatedAt: Date.now()
  };
  //console.log(customer);
  Customer.findOneAndUpdate(
    { netSuiteId : customer.netsuiteId },
    customer,
    { upsert: true, new: true } // insert the document if it does not exist
  ).exec(callback);
}


module.exports = getCustomers;
