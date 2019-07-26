const ChangeLog = require('../../../models/changeLog')
const {diff} = require('deep-diff')
const TBA = require('../../../helpers/tokenBasedAuthentication')
const {isEmpty} = require('tedb-utils')
const KillCode = require('../../../models/killCode')


const killCodeListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=92&deploy=1&listid=customlist_killcode';
const scriptID = 99

const queryKillCodes = () => {
    return new Promise((resolve, reject) => {
        let backoff = 200
        let retries = 8
        const makeCall = (repeats) => {
            const killCodeLink = new TBA(killCodeListUrl)
            killCodeLink.getRequest(51,
                (body) => {
                    body = JSON.parse(body)
                    if (!isEmpty(body) && !isEmpty(body.error)) {
                        const error_message = body.error.code ||
                            JSON.stringify(body)
                        if (['ECONNRESET', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'SSS_REQUEST_LIMIT_EXCEEDED'].indexOf(
                            error_message) !==
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
                    if (['ECONNRESET', 'ESOCKETTIMEDOUT', 'ETIMEDOUT', 'SSS_REQUEST_LIMIT_EXCEEDED'].indexOf(
                        error_message) !==
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

const addChangeLog = (docs, killCodes) => {
    return new Promise((resolve, reject) => {
        const changes = [];
        killCodes.forEach((killCode) => {
            let found = false;
            docs.forEach((doc) => {
                if (doc.netsuiteId === killCode.netsuiteId) {
                    found = true;
                    changes.push({
                        diff:   diff(killCode, doc),
                        old:    killCode.netsuiteId,
                        newDoc: doc.netsuiteId
                    });
                }
            });
            if (!found) {
                changes.push({
                    diff:   'removed',
                    old:    killCode.netsuiteId,
                    newDoc: null,
                });
            }
        });
        docs.forEach((doc) => {
            let found = false;
            killCodes.forEach((killCode) => {
                if (doc.netsuiteId === killCode.netsuiteId) {
                    found = true;
                }
            });
            if (!found) {
                changes.push(
                    {
                        diff:   'added',
                        old:    null,
                        newDoc: doc.netsuiteId
                    });
            }
        });
        const changeObj = {
            name:       'KillCodes',
            added:      [],
            changed:    [],
            removed:    [],
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
        KillCode.update({isSynced: true}, {isSynced: false}, {multi: true}, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

const formatKillCode = (killCode) => {
    return {
        isSynced:   true,
        label:      killCode.label,
        netsuiteId: killCode.netsuiteId,
    };
};


const killCodeFormat = (ele) => {
    const list = ele.split(', ');
    return {
        isSynced:   true,
        label:      list[0],
        netsuiteId: list[1]
    };
};

const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        KillCode.findOneAndUpdate(
            {netsuiteId: doc.netsuiteId},
            {
                $set: {
                    netsuiteId:   doc.netsuiteId,
                    label:        doc.label,
                    activeStatus: !doc.isSynced,
                    isSynced:     doc.isSynced,
                }
            },
            {
                upsert: true,
                new:    true
            }, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
    });
};

const setNotSyncedToInactive = () => {
    return new Promise((resolve, reject) => {
        KillCode.update({isSynced: false}, {activeStatus: true}, {multi: true},
            (err) => {
                if (err) return reject(err);
                resolve();
            });
    });
};

module.exports = function () {
    return new Promise((resolve, reject) => {
        let docs
        let FormattedDocs
        let FormattedKillCodes
        let returnData

        queryKillCodes()
            .then((res) => {
                docs = res
                return updateSyncedFalse()
            })
            .then(() => KillCode.find({}).exec())
            .then((killCodes) => {
                FormattedDocs = docs.reduce((acc, d) => {
                    const list = d.split(', ')
                    if (list[1] !== null || d !== undefined || d !== null) {
                        return acc.concat(killCodeFormat(d))
                    } else {
                        return acc
                    }
                }, [])
                FormattedKillCodes = killCodes.map((u) => formatKillCode(u))
                return addChangeLog(FormattedDocs, FormattedKillCodes)
            })
            .then(() => {
                const promises = []
                FormattedDocs.forEach((fd) => promises.push(findAndUpdate(fd)))
                return Promise.all(promises)
            })
            .then((res) => {
                returnData = res
                return setNotSyncedToInactive()
            })
            .then(() => {
                resolve(returnData)
            })
            .catch(reject)
    })
}
