
var needle = require('needle');
var async = require('async');
var Vendor = require('../../models/vendor');
var exec = require('child_process').exec,
  child;

var vendorSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=vendor&id=276';
var options = {
  headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
    'User-Agent' : 'SuiteScript-Call',
    'Content-Type' : 'application/json'
  }

};

function getVendors(callback) {
  needle.get(vendorSearchUrl, options, function (err,data){
    if (err){ return err; }

    var vendorArray = Object.keys(data.body).reduce(function (acc, id) { // turn json into array
      if (data.body[id].id !== '-3') {
        return acc.concat([data.body[id]]);
      } else {
        return acc;
      }
    }, []);
    async.eachSeries(vendorArray, vendorFormat, function (err) {
      if (err) { return callback(err); }
      Vendor.find({}, function (err, data) {
        return callback(err, data);
      });
    });
  });
}

function vendorFormat (ele, callback) {
  ele.columns.phone = ele.columns.hasOwnProperty('phone') ? ele.columns.phone : '';
  ele.columns.category = ele.columns.hasOwnProperty('category') ? (ele.columns.category.hasOwnProperty('name') ? ele.columns.category.name : '') : '';
  ele.columns.email = ele.columns.hasOwnProperty('email') ? ele.columns.email : '';
  ele.columns.contact = ele.columns.hasOwnProperty('contact') ? (ele.columns.contact.hasOwnProperty('name') ? ele.columns.contact.name : '') : '';
  try {
    var vendor = {
      netsuiteId: ele.id,
      name: ele.columns.entityid,
      phone: ele.columns.phone,
      email: ele.columns.email,
      primaryContact: ele.columns.contact,
      category: ele.columns.category,
    };
    Vendor.findOneAndUpdate(
      {netsuiteId: vendor.netsuiteId},
      vendor,
      {upsert: true, new: true} // insert the document if it does not exist
    ).exec(callback);
  }
  catch (e){
    callback(e);
  }
}


module.exports = getVendors;
