const ChangeLog = require('../../models/changeLog');
const {diff} = require('deep-diff');
const axios = require('axios');
const Location = require('../../models/location.js');

const locationSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=location&id=100';

const options = {
    headers: {
        'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy2018~',
        'User-Agent':    'SuiteScript-Call',
        'Content-Type':  'application/json'
    }

};

const queryLocations = (url, headerOptions) => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
                headers: headerOptions.headers
            })
            .then(resolve)
            .catch(reject);
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
        docs.forEach((doc) => {
            let found = false;
            locations.forEach((location) => {
                if (doc.netsuiteId === location.netsuiteId) {
                    found = true;
                }
            });
            if (!found) {
                changes.push({diff: 'added', old: null, newDoc: doc.netsuiteId});
            }
        });
        const changeObj = {
            name: 'Locations',
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
        Location.update({isSynced: true}, {isSynced: false}, {multi: true}, (err) => {
            if (err) return reject(err);
            resolve();
        });
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
        netsuiteId: +ele.id,
        name: ele.columns.name
    };
};

const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        Location.findOneAndUpdate(
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
        Location.remove({isSynced: false}).exec((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};
module.exports = function () {
    return new Promise((resolve, reject) => {
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
                resolve(returnData);
            })
            .catch(reject);
    });
};
