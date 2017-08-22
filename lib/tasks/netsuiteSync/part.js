
var needle = require('needle');
var async = require('async');
var Part = require('../../models/part.js');
var axios = require('axios');
var exec = require('child_process').exec,
    child;

var partSearchUrl1 = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=item&id=90';
var partSearchUrl2 = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=item&id=219';
var urls = [partSearchUrl1, partSearchUrl2];
var options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2017~',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

/**
 * Query the Parts based on url
 * @param url
 * @param headerOptions
 * @returns {*}
 */
const queryParts = (url, headerOptions) => {
  return axios.get(url, {
    headers: headerOptions.headers
  });
};

/**
 * Update all isSynced Parts to isSynced False
 * @returns {Promise}
 */
const updateSyncedFalse = () => {
  return new Promise((resolve, reject) => {
    Part.update({isSynced: true}, {isSynced: false}, {multi: true}, (err) => {
      if (err) return reject(err);
      resolve();
    })
  });
};

/**
 * Format incoming parts to the correct structure of the schema
 * @param ele
 * @returns {{netSuiteId, description: *, componentName: *, MPN: *}}
 */
const partFormant = (ele) => {
  return {
    isSynced: true,
    netsuiteId: ele.id,
    description: ele.columns.salesdescription ? ele.columns.salesdescription : '',
    componentName: ele.columns.itemid,
    MPN: ele.columns.mpn ? ele.columns.mpn : ''
  };
};

/**
 * Find the part if it exists and update with the new information
 * which includes setting isSynced back to true. So when cleaning up
 * any unsynced parts are removed
 * @param doc
 * @returns {Promise}
 */
const findAndUpdate = (doc) => {
  return new Promise((resolve, reject) => {
    Part.findOneAndUpdate(
      {netsuiteId: doc.netsuiteId},
      doc,
      {upsert: true, new: true}).exec((err, data) => {
        if(err) return reject(err);
        resolve(data);
      })
  });
};

/**
 * Remove all isSynced Parts that are false still
 * @returns {Promise}
 */
const removeNotSynced = () => {
  return new Promise((resolve, reject) => {
    Part.remove({isSynced: false}).exec((err) => {
      if (err) return reject(err);
      resolve();
    })
  });
};

const getParts = (callback) => {
  let docs = [];
  let FormattedDocs;
  let returnData;
  let promises = [];
  urls.forEach((url) => {
    promises.push(queryParts(url, options));
  });
  Promise.all(promises)
    .then((res) => {
      res.forEach((response) => {
        docs.push(...response.data);
      });
      return updateSyncedFalse();
    })
    .then(() => {
      const updatePromises = [];
      FormattedDocs = docs.map((d) => partFormant(d));
      FormattedDocs.forEach((fd) => updatePromises.push(findAndUpdate(fd)));
      return Promise.all(updatePromises);
    })
    .then((res) => {
      returnData = res;
      return removeNotSynced();
    })
    .then(() => {
      callback(null, returnData);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    });
};

/*function getParts(callback) {
  needle.get(partSearchUrl, options, function (err,data){
    if (err){ return err; }
    if(data.body){
      var partsArray = Object.keys(data.body).map(function (id) { // turn json into array
        return data.body[id];
      });
    }
    else{
      return callback(err);
    }
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
      MPN: ele.columns.mpn
  };
  Part.findOneAndUpdate(
    { netSuiteId : part.netsuiteId },
    part,
    { upsert: true, new: true } // insert the document if it does not exist
  ).exec(callback);
}*/


module.exports = getParts;
