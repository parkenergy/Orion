const ChangeLog = require('../../models/changeLog');
const {diff} = require('deep-diff');
const TBA = require('../../helpers/tokenBasedAuthentication')
const {isEmpty} = require('tedb-utils')
const ApplicationType = require('../../models/applicationType');

const applicationTypeListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=92&deploy=1&listid=customlist_applicationtype';

const queryApplicationTypes = () => {
    return new Promise((resolve, reject) => {
        let backoff = 200
        let retries = 8
        const makeCall = (repeats) => {
            const applicationLink = new TBA(applicationTypeListUrl)
            applicationLink.getRequest(51,
                (body) => {
                    body = JSON.parse(body)
                    if (!isEmpty(body) && !isEmpty(body.error)) {
                        const error_message = body.error.code ||
                            JSON.stringify(body)
                        if (['ECONNRESET', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'SSS_REQUEST_LIMIT_EXCEEDED'].indexOf(error_message) !==
                            -1) {
                            if (repeats > 0) {
                                if (backoff && retries) {
                                    setTimeout(() => {
                                        makeCall(repeats - 1)
                                    }, backoff * (retries - (repeats + 1)))
                                } else {
                                    makeCall(repeats - 1)
                                }
                            } else {
                                return reject(body.error)
                            }
                        } else {
                            return reject(body.error)
                        }
                    } else {
                        resolve(body)
                    }
                }, (error) => {
                    console.log(error)
                    const error_message = error.error.code ||
                        JSON.stringify(error)
                    if (['ECONNRESET', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'SSS_REQUEST_LIMIT_EXCEEDED'].indexOf(error_message) !==
                        -1) {
                        if (repeats > 0) {
                            if (backoff && retries) {
                                setTimeout(() => {
                                    makeCall(repeats - 1)
                                }, backoff * (retries - (repeats + 1)))
                            } else {
                                makeCall(repeats - 1)
                            }
                        } else {
                            reject(error)
                        }
                    } else {
                        reject(error)
                    }
                })
        }
        makeCall(retries)
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

        queryApplicationTypes()
            .then((res) => {
                docs = res
                return updateSyncedFalse()
            })
            .then(() => ApplicationType.find({})
                                       .exec())
            .then((applicationTypes) => {
                FormattedDocs = docs.reduce((acc, d) => {
                    const list = d.split(', ')
                    if (list[1] !== null || d !== undefined || d !== null) {
                        return acc.concat(applicationTypeFormat(d))
                    } else {
                        return acc
                    }
                }, [])
                FormattedApplicationTypes = applicationTypes.map((u) => formatApplicationType(u))
                return addChangeLog(FormattedDocs, FormattedApplicationTypes)
            })
            .then(() => {
                const promises = []
                FormattedDocs.forEach((fd) => promises.push(findAndUpdate(fd)))
                return Promise.all(promises)
            })
            .then((res) => {
                returnData = res
                return removeNotSynced()
            })
            .then(() => {
                resolve(returnData)
            })
            .catch(reject)
    });
};
