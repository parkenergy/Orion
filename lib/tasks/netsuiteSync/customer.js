
var needle = require('needle');
var async = require('async');
var Customer = require('../../models/customer');
var exec = require('child_process').exec,
    child;

var customerSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=customer&id=64';
var options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

function getCustomers(callback) {
  needle.get(customerSearchUrl, options, function (err,data){
    if (err){ return err; }
    var customerArray = Object.keys(data.body).map(function (id) { // turn json into array
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

function customerFormat (ele, callback) {
  try {
    var customer = {
      shortname: ele.columns.entityid,
      name: ele.columns.altname,
      phone: ele.columns.phone,
      netsuiteId: ele.id,
      email: ele.columns.email,
      updatedAt: Date.now()
    };
    Customer.findOneAndUpdate(
      {netsuiteId: customer.netsuiteId},
      customer,
      {upsert: true, new: true} // insert the document if it does not exist
    ).exec(callback);
  }
  catch (e){
    callback(e);
  }
}


module.exports = getCustomers;
