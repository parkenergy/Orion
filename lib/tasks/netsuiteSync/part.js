const Part = require('../../models/part.js');
const axios = require('axios');
const ChangeLog = require('../../models/changeLog');
const {diff} = require('deep-diff');

const partSearchUrl1 = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=item&id=90';
const partSearchUrl2 = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=item&id=219';
const urls = [partSearchUrl1, partSearchUrl2];
const options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
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

const addChangeLog = (docs, parts) => {
  return new Promise((resolve, reject) => {
    const changes = [];
    parts.forEach((part) => {
      let found = false;
      docs.forEach((doc) => {
        if (doc.netsuiteId === part.netsuiteId) {
          found = true;
          changes.push({diff: diff(part, doc), old: part.netsuiteId, newDoc: doc.netsuiteId});
        }
      });
      if (!found) {
        changes.push({diff: 'removed', old: part.netsuiteId, newDoc: null});
      }
    });
    docs.forEach((doc) => {
      let found = false;
      parts.forEach((part) => {
        if (doc.netsuiteId === part.netsuiteId) {
          found = true;
        }
      });
      if (!found) {
        changes.push({diff: 'added', old: null, newDoc: doc.netsuiteId});
      }
    });
    const changeObj = {
      name: 'Parts',
      added: [],
      changed: [],
      removed: [],
      changeMade: new Date(),
    };
    changes.forEach((change) => {
      if (change.diff === 'removed') {
        changeObj.removed.push(change.old);
      }
      if (change.diff === 'added') {
        changeObj.added.push(change.newDoc);
      }
      if (change.diff !== undefined && change.diff !== 'removed' && change.diff !== 'added') {
        changeObj.changed.push(change.newDoc);
      }
    });
    if (changeObj.changed.length === 0 && changeObj.removed.length === 0 && changeObj.added.length === 0) {
      resolve();
    } else {
      new ChangeLog(changeObj).save((err) => {
        if (err) return reject(err);
        resolve();
      })
    }
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

const formatPart = (part) => {
  return {
    isSynced: true,
    netsuiteId: part.netsuiteId,
    description: part.description,
    componentName: part.componentName,
    MPN: part.MPN,
  };
};

/**
 * Format incoming parts to the correct structure of the schema
 * @param ele
 * @returns {{netSuiteId, description: *, componentName: *, MPN: *}}
 */
const partFormant = (ele) => {
  return {
    isSynced: true,
    netsuiteId: +ele.id,
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
  let FormattedParts;
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
    .then(() => Part.find({}).exec())
    .then((parts) => {
      FormattedDocs = docs.map((d) => partFormant(d));
      FormattedParts = parts.map((p) => formatPart(p));
      return addChangeLog(FormattedDocs, FormattedParts);
    })
    .then(() => {
      const updatePromises = [];
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

module.exports = getParts;
