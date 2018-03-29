const ChangeLog = require('../../models/changeLog');
const diff = require('deep-diff').diff;
const axios = require('axios');
const Location = require('../../models/location.js');
let exec = require('child_process').exec,
  child;

const locationSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=location&id=100';

const options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

const queryLocations = (url, headerOptions) => {
  return axios.get(url, {
    headers: headerOptions.headers
  });
};

const addChangeLog = (docs, locations) => {
  return new Promise((resolve, reject) => {
    const changes = [];
    locations.forEach((location) => {
      let found = false;
      docs.forEach((doc) => {
        if (doc.netsuiteId === location.netsuiteId) {
          found = true;
          changes.push({diff: diff(location, doc), old: location.netsuiteId, newDoc: doc.netsuiteId});
        }
      });
      if (!found) {
        changes.push({diff: 'removed', old: location.netsuiteId, newDoc: null});
      }
    });
    const changeObj = {
      name: 'Locations',
      changed: [],
      removed: [],
      changeMade: new Date(),
    };
    changes.forEach((change) => {
      if (change.diff === 'removed') {
        changeObj.removed.push(change.old);
      }
      if (change.diff !== undefined && change.diff !== 'removed') {
        changeObj.changed.push(change.newDoc);
      }
    });
    if (changeObj.changed.length === 0 && changeObj.removed.length === 0) {
      resolve();
    } else {
      new ChangeLog(changeObj).save((err) => {
        if (err) return reject(err);
        resolve();
      })
    }
  });
};

const updateSyncedFalse = () => {
  return new Promise((resolve) => {
    Location.update({isSynced: true}, {isSynced: false}, {multi: true}, () => {
      resolve();
    })
  });
};

const formatLocation = (location) => {
  return {
    isSynced: true,
    netsuiteId: location.netsuiteId,
    name: location.name,
  };
};

const locationFormat = (ele) => {
  return {
    isSynced: true,
    netsuiteId: ele.id,
    name: ele.columns.name
  };
};

const findAndUpdate = (doc) => {
  return new Promise((resolve, reject) => {
    Location.findOneAndUpdate(
      {netsuiteId: doc.netsuiteId},
      doc,
      {upsert: true, new: true}).exec((err, data) => {
      if(err) return reject(err);
      resolve(data);
    });
  });
};

const removeNotSynced = () => {
  return new Promise((resolve, reject) => {
    Location.remove({isSynced: false}).exec((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const getLocations = (callback) => {
  let docs;
  let FormattedDocs;
  let FormattedLocations;
  let returnData;
  queryLocations(locationSearchUrl, options)
    .then((res) => {
      docs = res.data;
      return updateSyncedFalse();
    })
    .then(() => Location.find({}).exec())
    .then((locations) => {
      FormattedDocs = docs.map((d) => locationFormat(d));
      FormattedLocations = locations.map((u) => formatLocation(u));
      return addChangeLog(FormattedDocs, FormattedLocations);
    })
    .then(() => {
      const promises = [];
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

module.exports = getLocations;
