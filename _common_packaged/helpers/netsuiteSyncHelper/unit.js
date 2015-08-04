
var needle = require('needle');
var async = require('async');
var Unit = require('../../models/unit.js');
var Customer = require('../../models/customer.js');
var User = require('../../models/user.js')
var exec = require('child_process').exec,
    child;

var unitSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=customrecord_ncfar_asset&id=91';
var options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=Netsuite01',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

function getUnits(callback) {
  console.log('Get Units');
  needle.get(unitSearchUrl, options, function(err,data){
    console.log('Needle Worked');
    if (err){ return err; }
    console.log('Format NetSuite');
    var unitArray = Object.keys(data.body).map(function(id) { // turn json into array
      return data.body[id];
    });
    async.eachSeries(unitArray, unitFormat, function (err) {
      if (err) { return callback(err); }
      Unit.find({}, function (err, data) {
        return callback(err, data);
      });
    });
  });
}

function unitFormat (ele, callback) {
  console.log(ele.id);
  var unit = {
    number: ele.columns.name,
    productSeries: ele.columns.custrecord_comptype.name,
    locationName: ele.columns.custrecord_leasename,
    legalDescription: ele.columns.custrecord_legaldescription,
    netsuiteId: ele.id,
    updatedAt: Date.now()
  };
  var customerNetsuiteId = (!ele.columns.custrecord_asset_customer
    || !ele.columns.custrecord_asset_customer.internalid)
    ? 0 : ele.columns.custrecord_asset_customer.internalid;
  Customer.findOne({ netsuiteId: customerNetsuiteId }, function( err, customer ) {
    if (err) { return callback(err);}
    unit.Customer = (!customer || !customer._id) ? null : customer._id;

    var userNetsuiteId = (!ele.columns.custrecord_assignedtech
      || ele.columns.custrecord_assignedtech.internalid)
      ? 0 : ele.columns.custrecord_assignedtech.internalid;
    User.findOne({ netsuiteId: userNetsuiteId }, function (err, user) {
      if (err) { return callback(err); }
      unit.assignedTo = (!user || !user._id ) ? null : user._id;

      console.log(unit);

      Unit.findOneAndUpdate(
        { netsuiteId : unit.netsuiteId },
        unit,
        { upsert: true, new: true } // insert the document if it does not exist
      ).exec(callback);
    })
  });
}

module.exports = getUnits;
