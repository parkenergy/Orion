
const axios = require('axios');
const Vendor = require('../../models/vendor');
const ChangeLog = require('../../models/changeLog');
const diff = require('deep-diff').diff;
let exec = require('child_process').exec,
  child;

const vendorSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=vendor&id=276';
const options = {
  headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
    'User-Agent' : 'SuiteScript-Call',
    'Content-Type' : 'application/json'
  }

};

const queryVendors = (url, headerOptions) => {
  return axios.get(url, {
    headers: headerOptions.headers
  });
};

const addChangeLog = (docs, vendors) => {
  return new Promise((resolve, reject) => {
    const changes = [];
    vendors.forEach((vendor) => {
      let found = false;
      docs.forEach((doc) => {
        if (doc.netsuiteId === vendor.netsuiteId) {
          found = true;
          changes.push({diff: diff(vendor, doc), old: vendor.netsuiteId, newDoc: doc.netsuiteId});
        }
      });
      if (!found) {
        changes.push({diff: 'removed', old: vendor.netsuiteId, newDoc: null});
      }
    });
    docs.forEach((doc) => {
      let found = false;
      vendors.forEach((vendor) => {
        if (doc.netsuiteId === vendor.netsuiteId) {
          found = true;
        }
      });
      if (!found) {
        changes.push({diff: 'added', old: null, newDoc: doc.netsuiteId});
      }
    });
    const changeObj = {
      name: 'Vendors',
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
    Vendor.update({isSynced: true}, {isSynced: false}, {multi: true}, () => {
      resolve();
    });
  });
};

const formatVendor = (vendor) => {
  return {
    isSynced: true,
    netsuiteId: vendor.netsuiteId,
    name: vendor.name,
    phone: vendor.phone,
    email: vendor.email,
    isCounterOrderType: vendor.isCounterOrderType,
    primaryContact: vendor.primaryContact,
    category: vendor.category,
  };
};

const vendorFormat = (ele) => {
  const phone = ele.columns.hasOwnProperty('phone') ? ele.columns.phone : '';
  const category = ele.columns.hasOwnProperty('category') ? (ele.columns.category.hasOwnProperty('name') ? ele.columns.category.name : '') : '';
  const email = ele.columns.hasOwnProperty('email') ? ele.columns.email : '';
  const contact = ele.columns.hasOwnProperty('contact') ? (ele.columns.contact.hasOwnProperty('name') ? ele.columns.contact.name : '') : '';
  const isCounterOrderType = ele.columns.custentity_counter_order_type;
  return {
    isSynced: true,
    netsuiteId: ele.id,
    name: ele.columns.entityid,
    phone: phone,
    isCounterOrderType: isCounterOrderType,
    email: email,
    primaryContact: contact,
    category: category,
  };
};

const findAndUpdate = (doc) => {
  return new Promise((resolve, reject) => {
    Vendor.findOneAndUpdate(
      {netsuiteId: doc.netsuiteId},
      doc,
      {upsert: true, new: true}).exec((err, data) => {
        if (err) return reject(err);
        resolve(data);
    });
  });
};

const removeNotSynced = () => {
  return new Promise((resolve, reject) => {
    Vendor.remove({isSynced: false}).exec((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const getVendors = (callback) => {
  let docs;
  let FormattedDocs;
  let FormattedVendors;
  let returnData;
  queryVendors(vendorSearchUrl, options)
    .then((res) => {
      docs = res.data;
      return updateSyncedFalse();
    })
    .then(() => Vendor.find({}).exec())
    .then((vendors) => {
      FormattedDocs = docs.reduce((acc, d) => {
        if (d.id !== '-3') {
          return acc.concat(vendorFormat(d));
        } else {
          return acc;
        }
      }, []);
      FormattedVendors = vendors.map((v) => formatVendor(v));
      return addChangeLog(FormattedDocs, FormattedVendors);
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
    });
};

module.exports = getVendors;
