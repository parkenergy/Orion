const ChangeLog = require('../../models/changeLog');
const {diff} = require('deep-diff');
const Customer = require('../../models/customer');
const axios = require('axios');
let exec = require('child_process').exec,
    child;

const customerSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=customer&id=64';
const options = {
    headers: {
        'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy2018~',
        'User-Agent':    'SuiteScript-Call',
        'Content-Type':  'application/json'
    }

};

const queryCustomers = (url, headerOptions) => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
                headers: headerOptions.headers
            })
            .then(resolve)
            .catch((err) => {
                reject(err);
            });
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
        docs.forEach((doc) => {
            let found = false;
            customers.forEach((customer) => {
                if (doc.netsuiteId === customer.netsuiteId) {
                    found = true;
                }
            });
            if (!found) {
                changes.push({diff: 'added', old: null, newDoc: doc.netsuiteId});
            }
        });
        const changeObj = {
            name: 'Customers',
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
            });
        }
    });
};

const updateSyncedFalse = () => {
    return new Promise((resolve, reject) => {
        Customer.update({isSynced: true}, {isSynced: false}, {multi: true}, function (err, raw) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
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
    };
};

const customerFormat = (ele) => {
    return {
        isSynced: true,
        shortname: ele.columns.entityid,
        name: ele.columns.altname,
        phone: ele.columns.phone ? ele.columns.phone : null,
        netsuiteId: ele.id,
        email: ele.columns.email ? ele.columns.email : null,
    };
};

const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        Customer.findOneAndUpdate(
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
        Customer.remove({isSynced: false}).exec((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

const getCustomers = () => {
    return new Promise((resolve, reject) => {
        let docs;
        let FormattedDocs;
        let FormattedCustomer;
        let returnData;
        queryCustomers(customerSearchUrl, options)
            .then((res) => {
                docs = res.data;
                return updateSyncedFalse();
            })
            .then(() => {
            return Customer.find({}).exec();
            })
            .then((customers) => {
                FormattedDocs = docs.map((d) => customerFormat(d));
                FormattedCustomer = customers.map((u) => formatCustomer(u));
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
                resolve(returnData);
            })
            .catch(reject);
    });
};

module.exports = getCustomers;
