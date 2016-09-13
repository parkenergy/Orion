
var needle = require('needle');
var async = require('async');
var log = require('../../helpers/logger');
var User = require('../../models/user.js');
var exec = require('child_process').exec,
    child;

var userSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=employee&id=97';
var options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy~2016',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

function getUsers(callback) {
  needle.get(userSearchUrl, options, function (err,data){
    if (err) return callback(err);

    User.remove({}).exec(function (err) {
      if (err) return callback(err);

      var userArray = Object.keys(data.body).map(function (id) { // turn json into array
        return data.body[id];
      });
      async.eachSeries(userArray, userFormat, function (err) {
        if (err) { return callback(err); }
        User.find({}, function (err, data) {
          return callback(err, data);
        });
      });
    });
  });
}

function userFormat (ele, callback) {

  ele.columns.supervisor = ele.columns.supervisor ? ele.columns.supervisor : ele.columns.supervisor = {name: null};

  var user = {
    firstName: ele.columns.firstname,
    lastName: ele.columns.lastname,
    username: ele.columns.entityid,
    email: ele.columns.email,
    supervisor: ele.columns.supervisor.name,
    role: ele.columns.custentity_orion_administrator ? 'admin' : (ele.columns.custentity_field_service_manager ? 'manager' : 'tech'),
    netsuiteId: ele.id,
    updatedAt: Date.now()
  };
  User.findOneAndUpdate(
    { netsuiteId : user.netsuiteId },
    user,
    { upsert: true, new: true, safe: false } // insert the document if it does not exist
  ).exec(callback);
}

module.exports = getUsers;
