const ChangeLog = require('../../models/changeLog')
const {diff} = require('deep-diff')
const axios = require('axios')
const EngineModel = require('../../models/engineModel')
let exec = require('child_process').exec,
    child

const engineModelListUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=92&deploy=1&listid=customlist_eng_model'

const options = {
    headers: {
        'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy2018~',
        'User-Agent':    'SuiteScript-Call',
        'Content-Type':  'application/json',
    },

}

const queryEngineModels = (url, headerOptions) => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
                headers: headerOptions.headers,
            })
            .then(resolve)
            .catch(reject)
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
                    {diff: 'added', old: null, newDoc: doc.netsuiteId})
            }
        })
        const changeObj = {
            name:       'ApplicationTypes',
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
            if (err) return reject(err)
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
            {upsert: true, new: true}).exec((err, data) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

const removeNotSynced = () => {
    return new Promise((resolve, reject) => {
        EngineModel.remove({isSynced: false}).exec((err) => {
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
        queryEngineModels(engineModelListUrl, options)
            .then((res) => {
                docs = res.data
                return updateSyncedFalse()
            })
            .then(() => EngineModel.find({}).exec())
            .then((engineModels) => {
                FormattedDocs = docs.reduce((acc, d) => {
                    if (d.id !== null) {
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
                return removeNotSynced()
            })
            .then(() => {
                resolve(returnData)
            })
            .catch(reject)
    })
}
