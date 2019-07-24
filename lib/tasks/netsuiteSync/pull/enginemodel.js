const ChangeLog = require('../../../models/changeLog')
const {diff} = require('deep-diff')
const TBA = require('../../../helpers/tokenBasedAuthentication')
const {isEmpty} = require('tedb-utils')
const EngineModel = require('../../../models/engineModel')
let exec = require('child_process').exec,
    child

const engineModelListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=92&deploy=1&listid=customlist_eng_model'

const queryEngineModels = () => {
    return new Promise((resolve, reject) => {
        let backoff = 200
        let retries = 8
        const makeCall = (repeats) => {
            const engineModelLink = new TBA(engineModelListUrl)
            engineModelLink.getRequest(76,
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
    })
}

const addChangeLog = (docs, engineModels) => {
    return new Promise((resolve, reject) => {
        const changes = []
        engineModels.forEach((engineModel) => {
            let found = false
            docs.forEach((doc) => {
                if (doc.netsuiteId === engineModel.netsuiteId) {
                    found = true
                    changes.push({
                        diff:   diff(engineModel, doc),
                        old:    engineModel.netsuiteId,
                        newDoc: doc.netsuiteId,
                    })
                }
            })
            if (!found) {
                changes.push({
                    diff:   'removed',
                    old:    engineModel.netsuiteId,
                    newDoc: null,
                })
            }
        })
        docs.forEach((doc) => {
            let found = false
            engineModels.forEach((engineModel) => {
                if (doc.netsuiteId === engineModel.netsuiteId) {
                    found = true
                }
            })
            if (!found) {
                changes.push(
                    {
                        diff:   'added',
                        old:    null,
                        newDoc: doc.netsuiteId
                    })
            }
        })
        const changeObj = {
            name:       'EngineModels',
            added:      [],
            changed:    [],
            removed:    [],
            changeMade: new Date(),
        }
        changes.forEach((change) => {
            if (change.diff === 'removed') {
                changeObj.removed.push(change.old)
            }
            if (change.diff === 'added') {
                changeObj.added.push(change.newDoc)
            }
            if (change.diff !== undefined && change.diff !== 'removed' && change.diff !== 'added') {
                changeObj.changed.push(change.newDoc)
            }
        })
        if (changeObj.changed.length === 0 && changeObj.removed.length === 0 &&
            changeObj.added.length === 0) {
            resolve()
        } else {
            new ChangeLog(changeObj).save((err) => {
                if (err) return reject(err)
                resolve()
            })
        }
    })
}

const updateSyncedFalse = () => {
    return new Promise((resolve, reject) => {
        EngineModel.update({isSynced: true}, {isSynced: false}, {multi: true}, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}

const formatEngineModel = (engineModel) => {
    return {
        isSynced:   true,
        model:      engineModel.model,
        netsuiteId: engineModel.netsuiteId,
    }
}

const engineModelFormat = (ele) => {
    const list = ele.split(', ')
    return {
        isSynced:   true,
        model:      list[0],
        netsuiteId: list[1],
    }
}

const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        EngineModel.findOneAndUpdate(
            {netsuiteId: doc.netsuiteId},
            doc,
            {
                upsert: true,
                new:    true
            }, (err, data) => {
                if (err) return reject(err)
                resolve(data)
            })
    })
}

const setNotSyncedToInactive = () => {
    return new Promise((resolve, reject) => {
        EngineModel.update({isSynced: false}, {activeStatus: true}, {multi: true},
            (err) => {
                if (err) return reject(err)
                resolve()
            })
    })
}

module.exports = function () {
    return new Promise((resolve, reject) => {
        let docs
        let FormattedDocs
        let FormattedEngineModels
        let returnData
        queryEngineModels()
            .then((res) => {
                docs = res
                return updateSyncedFalse()
            })
            .then(() => EngineModel.find({})
                                   .exec())
            .then((engineModels) => {
                FormattedDocs = docs.reduce((acc, d) => {
                    const list = d.split(', ')
                    if (list[1] !== null && list[1] !== undefined && d !== undefined && d !==
                        null) {
                        return acc.concat(engineModelFormat(d))
                    } else {
                        return acc
                    }
                }, [])
                FormattedEngineModels = engineModels.map((u) => formatEngineModel(u))
                return addChangeLog(FormattedDocs, FormattedEngineModels)
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
