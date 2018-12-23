const ChangeLog = require('../../models/changeLog');
const {diff} = require('deep-diff');
const TBA = require('../../helpers/tokenBasedAuthentication')
const {isEmpty} = require('tedb-utils')
const AssetType = require('../../models/assetType');


const assettypeListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=92&deploy=1&listid=customlist_comptype';

const queryAssetTypes = () => {
    return new Promise((resolve, reject) => {
        let backoff = 200
        let retries = 8
        const makeCall = (repeats) => {
            const assetLink = new TBA(assettypeListUrl)
            assetLink.getRequest(48,
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
            });
        }
    });
};

const updateSyncedFalse = () => {
    return new Promise((resolve, reject) => {
        AssetType.update({isSynced: true}, {isSynced: false}, {multi: true}, (err) => {
            if (err) return reject(err);
            resolve();
        });
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
        AssetType.remove({isSynced: false}).exec((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

module.exports = function () {
    return new Promise((resolve, reject) => {
        let docs;
        let FormattedDocs;
        let FormattedAssetTypes;
        let returnData;
        queryAssetTypes()
            .then((res) => {
                docs = res
                return updateSyncedFalse()
            })
            .then(() => AssetType.find({})
                                 .exec())
            .then((assetTypes) => {
                FormattedDocs = docs.reduce((acc, d) => {
                    if (d.id !== null) {
                        return acc.concat(assetTypeFormat(d))
                    } else {
                        return acc
                    }
                }, [])
                FormattedAssetTypes = assetTypes.map((u) => formatAssetType(u))
                return addChangeLog(FormattedDocs, FormattedAssetTypes)
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
