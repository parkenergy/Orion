
var needle = require('needle');
var async = require('async');
var Unit = require('../../models/unit.js');
var Customer = require('../../models/customer.js');
var County = require('../../models/county.js');
var State = require('../../models/state.js');
var User = require('../../models/user.js');
var exec = require('child_process').exec,
    child;


// The urls and and headers required to send http requests to netsuite
var unitSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=customrecord_ncfar_asset&id=91';
var options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion~2017~',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

// Get the units from netsuite. Prepare them to be upserted.
function getUnits(callback) {
  needle.get(unitSearchUrl, options, function (err,data){
    if (err){ return err; }
    var unitArray = Object.keys(data.body).map(function (id) { // turn json into array
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

// Takes the data given to us from the json object and stick it into our data model
function unitFormat (ele, callback) {
  let coordinates;
  if(ele.columns.custrecord_fw_longitude &&
  ele.columns.custrecord_fw_latitude) {
    coordinates = [+ele.columns.custrecord_fw_longitude, +ele.columns.custrecord_fw_latitude];
  } else {
    coordinates = [0.0, 0.0];
  }
  
  
  var unit = {
    number: ele.columns.name,
    productSeries: ele.columns.custrecord_comptype.name,
    locationName: ele.columns.custrecord_leasename,
    legalDescription: ele.columns.custrecord_legaldescription,
    netsuiteId: ele.id,
    customerName: '',
    geo: { type: 'Point', coordinates },
    updatedAt: Date.now()
  };

  // Short versions of the json elements from netsuite
  var nsCust;
  var nsCustId;
  var nsUser;
  var nsUserId;
  var nsCounty;
  var nsState;


  // Checks to see if various parts of the json are not there
  if (ele.columns.altname){
    unit.customerName = ele.columns.altname;
  }
  if (ele.columns.custrecord_assignedtech){
    nsUser = ele.columns.custrecord_assignedtech;
    nsUserId = ele.columns.custrecord_assignedtech.internalid;
  }

  if (ele.columns.custrecord_assetcountylocation){
    nsCounty = ele.columns.custrecord_assetcountylocation;
  }

  if (ele.columns.custrecord_state){
    nsState = ele.columns.custrecord_state.name;
  }

  // If the objects are found, add them to the unit
  var userNetsuiteId = (!nsUser || !nsUserId) ? 0 :nsUserId;
  User.findOne({ netsuiteId: userNetsuiteId }, function (err, user) {
    if (err) { return callback(err); }
    unit.assignedTo = (!user || !user._id ) ? null : user._id;

    var countyName = !nsCounty ? 0 : nsCounty;
    County.findOne({ name : countyName }, function ( err, county) {
      if(err) { return callback(err); }
      unit.county = !county ? null : county._id;

      var stateName = !nsState ? 0 : nsState;
      State.findOne({ name : stateName }, function (err, state) {
        if(err) { return callback(err); }
        unit.state = !state ? null : state._id;

        // Finally upsert the unit
        Unit.findOneAndUpdate(
          { number : unit.number },
          unit,
          { upsert: true, new: true } // insert the document if it does not exist
        ).exec(callback);
      });
    });
  });
}

module.exports = getUnits;
