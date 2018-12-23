const ChangeLog = require('../../models/changeLog');
const {diff} = require('deep-diff');
const TBA = require('../../helpers/tokenBasedAuthentication')
const {isEmpty} = require('tedb-utils')
const Location = require('../../models/location.js');

const locationSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=location&id=100';

const queryLocations = () => {
    return new Promise((resolve, reject) => {
        let backoff = 200
        let retries = 8
        const makeCall = (repeats) => {
            const locationLink = new TBA(locationSearchUrl)
            locationLink.getRequest(100,
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
        queryLocations()
            .then((res) => {
                docs = res
                return updateSyncedFalse()
            })
            .then(() => Location.find({})
                                .exec())
            .then((locations) => {
                FormattedDocs = docs.map((d) => locationFormat(d))
                FormattedLocations = locations.map((u) => formatLocation(u))
                return addChangeLog(FormattedDocs, FormattedLocations)
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
