
var needle = require('needle');
var async = require('async');
var log = require('../../helpers/logger');
var User = require('../../models/user.js');
var axios = require('axios');
var exec = require('child_process').exec,
    child;

var userSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=employee&id=97';
var options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2017~',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

const queryUsers = (url, headerOptions) => {
  return axios.get(url, {
    headers: headerOptions.headers
  });
};

const updateSyncedFalse = () => {
  return new Promise((resolve) => {
    User.update({isSynced: true}, {isSynced: false}, {multi: true}, () => {
      resolve();
    })
  });
};

const userFormat = (ele) => {
  ele.columns.supervisor = ele.columns.supervisor ? ele.columns.supervisor : ele.columns.supervisor = {name: null};
  
  return {
    isSynced: true,
    firstName: ele.columns.firstname,
    lastName: ele.columns.lastname,
    username: ele.columns.entityid,
    email: ele.columns.email,
    supervisor: ele.columns.supervisor.name,
    role: ele.columns.custentity_orion_administrator ? 'admin' : (ele.columns.custentity_field_service_manager ? 'manager' : 'tech'),
    area: ele.columns.hasOwnProperty("class") ? ele.columns.class.name : "",
    netsuiteId: ele.id,
    updatedAt: Date.now()
  };
};

const findAndUpdate = (doc) => {
  return new Promise((resolve, reject) => {
    if (doc.email === null) {
      doc.email = "";
    }
    User.findOneAndUpdate(
      {netsuiteId: doc.netsuiteId},
      doc,
      {upsert: true, new: true}).exec( (err, data) => {
        if(err) return reject(err);
        resolve(data);
      })
  });
};

const removeNotSynced = () => {
  return new Promise((resolve, reject) => {
    User.remove({isSynced: false}).exec((err) => {
      if (err) return reject(err);
      resolve();
    })
  });
};

const getUsers = (callback) => {
  let docs;
  let FormattedDocs;
  let returnData;
  queryUsers(userSearchUrl, options)
    .then((res) => {
      docs = res.data;
      return updateSyncedFalse();
    })
    .then(() => {
      const promises = [];
      FormattedDocs = docs.map((d) => userFormat(d));
      FormattedDocs.forEach((fd) => promises.push(findAndUpdate(fd)));
      return Promise.all(promises);
    })
    .then((res) => {
      returnData = res;
      return removeNotSynced();
    })
    .then(() => {
      callback(null, returnData);
    })
    .catch((err) => {
      callback(err);
    })
};

/*
function getUsers(callback) {
  needle.get(userSearchUrl, options, function (err, data){
    if (err) return err;
    console.log("HELLO");
    console.log(data.body);
    if (data.body) {
      var userArray = Object.keys(data.body).map(function (id) { // turn json into array
        return data.body[id];
      });
    } else {
      return callback(err);
    }
    console.log(userArray)
  
    async.eachSeries(userArray, userFormat, function (err) {
      if (err) { return callback(err); }
      User.find({}, function (err, data) {
        return callback(err, data);
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
    area: ele.columns.hasOwnProperty("class") ? ele.columns.class.name : "",
    netsuiteId: ele.id,
    updatedAt: Date.now()
  };
  User.findOneAndUpdate(
    { netsuiteId : user.netsuiteId },
    user,
    { upsert: true, new: true } // insert the document if it does not exist
  ).exec(callback);
}
*/



module.exports = getUsers;
