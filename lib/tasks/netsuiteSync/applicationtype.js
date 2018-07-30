const ChangeLog = require('../../models/changeLog');
const {diff} = require('deep-diff');
const axios = require('axios');
const ApplicationType = require('../../models/applicationType');


const applicationTypeListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=92&deploy=1&listid=customlist_applicationtype';
const options = {
    headers: {
        'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy2018~',
        'User-Agent':    'SuiteScript-Call',
        'Content-Type':  'application/json'
    }

};

const queryApplicationTypes = (url, headerOptions) => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
                headers: headerOptions.headers
            })
            .then(resolve)
            .catch(reject);
    });
};

const addChangeLog = (docs, applicationTypes) => {
    return new Promise((resolve, reject) => {
        const changes = [];
        applicationTypes.forEach((applicationType) => {
            let found = false;
            docs.forEach((doc) => {
                if (doc.netsuiteId === applicationType.netsuiteId) {
                    found = true;
                    changes.push({
                        diff: diff(applicationType, doc),
                        old: applicationType.netsuiteId,
                        newDoc: doc.netsuiteId
                    });
                }
            });
            if (!found) {
                changes.push({
                    diff: 'removed',
                    old: applicationType.netsuiteId,
                    newDoc: null,
                });
            }
        });
        docs.forEach((doc) => {
            let found = false;
            applicationTypes.forEach((applicationType) => {
                if (doc.netsuiteId === applicationType.netsuiteId) {
                    found = true;
                }
            });
            if (!found) {
                changes.push(
                    {diff: 'added', old: null, newDoc: doc.netsuiteId});
            }
        });
        const changeObj = {
            name: 'ApplicationTypes',
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
        ApplicationType.update({isSynced: true}, {isSynced: false}, {multi: true}, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

const formatApplicationType = (applicationType) => {
    return {
        isSynced: true,
        type: applicationType.type,
        netsuiteId: applicationType.netsuiteId,
    };
};



const applicationTypeFormat = (ele) => {
    const list = ele.split(', ');
    return {
        isSynced: true,
        type: list[0],
        netsuiteId: list[1]
    };
};

const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        ApplicationType.findOneAndUpdate(
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
        ApplicationType.remove({isSynced: false}).exec((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

module.exports = function () {
    return new Promise((resolve, reject) => {
        let docs;
        let FormattedDocs;
        let FormattedApplicationTypes;
        let returnData;
        queryApplicationTypes(applicationTypeListUrl, options)
            .then((res) => {
                docs = res.data;
                return updateSyncedFalse();
            })
            .then(() => ApplicationType.find({}).exec())
            .then((applicationTypes) => {
                FormattedDocs = docs.reduce((acc, d) => {
                    if (d.id !== null) {
                        return acc.concat(applicationTypeFormat(d));
                    } else {
                        return acc;
                    }
                }, []);
                FormattedApplicationTypes = applicationTypes.map((u) => formatApplicationType(u));
                return addChangeLog(FormattedDocs, FormattedApplicationTypes);
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
