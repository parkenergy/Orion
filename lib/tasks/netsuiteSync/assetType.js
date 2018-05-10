const ChangeLog = require('../../models/changeLog');
const {diff} = require('deep-diff');
const axios = require('axios');
const AssetType = require('../../models/assetType');


const assettypeListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=92&deploy=1&listid=customlist_comptype';
const options = {
  headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
    'User-Agent' : 'SuiteScript-Call',
    'Content-Type' : 'application/json'
  }

};

const queryAssetTypes = (url, headerOptions) => {
  return axios.get(url, {
    headers: headerOptions.headers
  });
};

const addChangeLog = (docs, assetTypes) => {
  return new Promise((resolve, reject) => {
    const changes = [];
    assetTypes.forEach((assetType) => {
      let found = false;
      docs.forEach((doc) => {
        if (doc.netsuiteId === assetType.netsuiteId) {
          found = true;
          changes.push({diff: diff(assetType, doc), old: assetType.netsuiteId, newDoc: doc.netsuiteId});
        }
      });
      if (!found) {
        changes.push({diff: 'removed', old: assetType.netsuiteId, newDoc: null});
      }
    });
    docs.forEach((doc) => {
      let found = false;
      assetTypes.forEach((assetType) => {
        if (doc.netsuiteId === assetType.netsuiteId) {
          found = true;
        }
      });
      if (!found) {
        changes.push({diff: 'added', old: null, newDoc: doc.netsuiteId});
      }
    });
    const changeObj = {
      name: 'AssetTypes',
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

const updateSyncedFalse = () => {
  return new Promise((resolve) => {
    AssetType.update({isSynced: true}, {isSynced: false}, {multi: true}, () => {
      resolve();
    })
  });
};

const formatAssetType = (assetType) => {
  return {
    isSynced: true,
    type: assetType.type,
    netsuiteId: assetType.netsuiteId,
  };
};



const assetTypeFormat = (ele) => {
  const list = ele.split(', ');
  return {
    isSynced: true,
    type: list[0],
    netsuiteId: list[1]
  };
};

const findAndUpdate = (doc) => {
  return new Promise((resolve, reject) => {
    AssetType.findOneAndUpdate(
      { netsuiteId: doc.netsuiteId },
      doc,
      { upsert: true, new: true }).exec((err, data) => {
      if(err) return reject(err);
      resolve(data);
    });
  });
};

const removeNotSynced = () => {
  return new Promise((resolve, reject) => {
    AssetType.remove({isSynced: false}).exec((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const getAssetTypes = (callback) => {
  let docs;
  let FormattedDocs;
  let FormattedAssetTypes;
  let returnData;
  queryAssetTypes(assettypeListUrl, options)
    .then((res) => {
      docs = res.data;
      return updateSyncedFalse();
    })
    .then(() => AssetType.find({}).exec())
    .then((locations) => {
      FormattedDocs = docs.reduce((acc, d) => {
        if (d.id !== null) {
          return acc.concat(assetTypeFormat(d));
        } else {
          return acc;
        }
      }, []);
      FormattedAssetTypes = locations.map((u) => formatAssetType(u));
      return addChangeLog(FormattedDocs, FormattedAssetTypes);
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

module.exports = getAssetTypes;
