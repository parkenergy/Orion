const ChangeLog = require('../../models/changeLog');
const diff = require('deep-diff').diff;
const axios = require('axios');
const Customer = require('../../models/customer');
let exec = require('child_process').exec,
    child;

const customerSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=customer&id=64';
const options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

const queryCustomers = (url, headerOptions) => {
  return axios.get(url, {
    headers: headerOptions.headers
  });
};

const addChangeLog = (docs, customers) => {
  return new Promise((resolve, reject) => {
    const changes = [];
    customers.forEach((customer) => {
      let found = false;
      docs.forEach((doc) => {
        if (doc.netsuiteId === customer.netsuiteId) {
          found = true;
          changes.push({diff: diff(customer, doc), old: customer.netsuiteId, newDoc: doc.netsuiteId});
        }
      });
      if (!found) {
        changes.push({diff: 'removed', old: customer.netsuiteId, newDoc: null});
      }
    });
    const changeObj = {
      name: 'Customers',
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
    Customer.update({isSynced: true}, {isSynced: false}, {multi: true}, () => {
      resolve();
    })
  });
};

const formatCustomer = (customer) => {
  return {
    isSynced: true,
    name: customer.name,
    shortname: customer.shortname,
    netsuiteId: customer.netsuiteId,
    phone: customer.phone,
    email: customer.email,
  }
};

const customerFormat = (ele) => {
  return {
    shortname: ele.columns.entityid,
    name: ele.columns.altname,
    phone: ele.columns.phone,
    netsuiteId: ele.id,
    email: ele.columns.email,
    updatedAt: Date.now()
  };
};

const findAndUpdate = (doc) => {
  return new Promise((resolve, reject) => {
    Customer.findOneAndUpdate(
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
    Customer.remove({isSynced: false}).exec((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const getCustomers = (callback) => {
  let docs;
  let FormattedDocs;
  let FormattedCustomer;
  let returnData;
  queryCustomers(customerSearchUrl, options)
    .then((res) => {
      docs = res.data;
      return updateSyncedFalse();
    })
    .then(() => Customer.find({}).exec())
    .then((locations) => {
      FormattedDocs = docs.map((d) => customerFormat(d));
      FormattedCustomer = locations.map((u) => formatCustomer(u));
      return addChangeLog(FormattedDocs, FormattedCustomer);
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

module.exports = getCustomers;
