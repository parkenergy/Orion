const Unit = require('../../../models/unit.js')
const County = require('../../../models/county.js')
const State = require('../../../models/state.js')
const User = require('../../../models/user.js')
const FrameModel = require('../../../models/frameModel')
const EngineModel = require('../../../models/engineModel')
const ChangeLog = require('../../../models/changeLog')
const log = require('../../../helpers/logger')
const {diff} = require('deep-diff');
const TBA = require('../../../helpers/tokenBasedAuthentication')
const {isEmpty} = require('tedb-utils')



// The urls and and headers required to send http requests to netsuite
const unitSearchUrl1 = {
    url: 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=customrecord_ncfar_asset&id=91',
    id:  91,
}
const unitSearchUrl2 = {
    url: 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=customrecord_ncfar_asset&id=302',
    id:  302,
}

const urls = [unitSearchUrl1, unitSearchUrl2]

const queryUnits = (obj) => {
    return new Promise((resolve, reject) => {
        let backoff = 200
        let retries = 8
        const makeCall = (repeats) => {
            const unitLink = new TBA(obj.url)
            unitLink.getRequest(obj.id,
                (res) => {
                    res = JSON.parse(res)
                    if (!isEmpty(res) && !isEmpty(res.error)) {
                        const error_message = res.error.code || JSON.stringify(res)
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
                                return reject(res)
                            }
                        } else {
                            return reject(res)
                        }
                    } else {
                        resolve(res)
                    }
                }, (error) => {
                    if (!isEmpty(error.error)) {
                        const error_message = error.error.code || JSON.stringify(error)
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
                    } else {
                        reject(error)
                    }
                })
        }
        makeCall(retries)
    });
};

const addChangeLog = (docs, units) => {
    return new Promise((resolve, reject) => {
        const changes = [];
        units.forEach((unit) => {
            let found = false;
            docs.forEach((doc) => {
                if (doc.netsuiteId === unit.netsuiteId) {
                    found = true;
                    changes.push({diff: diff(unit, doc), old: unit.netsuiteId, newDoc: doc.netsuiteId});
                }
            });
            if (!found) {
                changes.push({diff: 'removed', old: unit.netsuiteId, newDoc: null});
            }
        });
        docs.forEach((doc) => {
            let found = false;
            units.forEach((unit) => {
                if (doc.netsuiteId === unit.netsuiteId) {
                    found = true;
                }
            });
            if (!found) {
                changes.push({diff: 'added', old: null, newDoc: doc.netsuiteId});
            }
        });
        const changeObj = {
            name: 'Units',
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
        Unit.update({isSynced: true}, {isSynced: false}, {multi: true}, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

const formatUnit = (unit) => {
    return {
        isSynced: true,
        number: unit.number,
        assignedTo: unit.assignedTo,
        productSeries: unit.productSeries,
        locationName:     unit.locationName,
        legalDescription: unit.legalDescription,
        netsuiteId:       unit.netsuiteId,
        customerName:     unit.customerName,
        geo:              {type: 'Point', coordinates: unit.geo.coordinates},
        engineSerial:     unit.engineSerial,
        compressorSerial: unit.compressorSerial,
        county:           unit.county ? unit.county._id : null,
        state:            unit.state ? unit.state._id : null,
        status:           unit.status,
        pmCycle:          unit.pmCycle,
        nextPmDate:       unit.nextPmDate,
        engineHP:         unit.engineHP,
        frameModel:       unit.frameModel ? unit.frameModel._id : null,
        engineModel:      unit.engineModel ? unit.engineModel._id : null,
        nextPM1Date:      unit.nextPM1Date,
        nextPM2Date:      unit.nextPM2Date,
        nextPM3Date:      unit.nextPM3Date,
        nextPM4Date:      unit.nextPM4Date,
        nextPM5Date:      unit.nextPM5Date,
    };
};

const unitFormat = (ele) => {
    return new Promise((resolve, reject) => {
        let coordinates;
        let county;
        let frame
        let engine
        let nsUserId;
        let assignedTo;
        let state;
        let customerName = ''
        if (ele.columns.hasOwnProperty('custrecord_fw_longitude') && ele.columns.hasOwnProperty('custrecord_fw_latitude')) {
            if (ele.columns.custrecord_fw_longitude &&
                ele.columns.custrecord_fw_latitude) {
                coordinates = [+ele.columns.custrecord_fw_longitude, +ele.columns.custrecord_fw_latitude];
            } else {
                coordinates = [0.0, 0.0];
            }
        } else {
            coordinates = [0.0, 0.0];
        }
        if (ele.columns.hasOwnProperty('custrecord_framemodel')) {
            if (ele.columns.custrecord_framemodel.hasOwnProperty('internalid')) {
                frame = ele.columns.custrecord_framemodel.internalid
            }
        }
        if (ele.columns.hasOwnProperty('custrecord_engine_model')) {
            if (ele.columns.custrecord_engine_model.hasOwnProperty('internalid')) {
                engine = ele.columns.custrecord_engine_model.internalid
            }
        }
        if (ele.columns.hasOwnProperty('custrecord_assetcountylocation')) {
            county = ele.columns.custrecord_assetcountylocation;
        }
        if (ele.columns.hasOwnProperty('custrecord_state')) {
            state = ele.columns.custrecord_state.name ? ele.columns.custrecord_state.name : '';
        }

        if (ele.columns.hasOwnProperty('custrecord_assignedtech')) {
            nsUserId = ele.columns.custrecord_assignedtech.internalid;
        }
        if (ele.columns.hasOwnProperty('altname')) {
            if (ele.columns.altname) {
                // old
                // ele.columns.custrecord_asset_customer.name
                customerName = ele.columns.altname
            }
        }
        nsUserId = !nsUserId ? 0 : nsUserId;
        User.findOne({netsuiteId: nsUserId}, function (err, user) {
            if (err) {
                return reject(err);
            }
            assignedTo = user ? user.username : null;

            State.findOne({name: {$regex: new RegExp(`^${state}`, 'i')}}, function (err, stateObj) {
                if (err) {
                    return reject(err);
                }
                state = !stateObj ? null : stateObj._id;

                County.findOne({
                    name:  {$regex: new RegExp(`^${county}`, 'i')},
                    state: {$regex: new RegExp(`^${state}`, 'i')},
                }, function (err, countyObj) {
                    if (err) {
                        return reject(err);
                    }
                    county = !countyObj ? null : countyObj._id;

                    const comptype = ele.columns.hasOwnProperty('custrecord_comptype')
                        ? (ele.columns.custrecord_comptype.hasOwnProperty('name')
                            ? ele.columns.custrecord_comptype.name
                            : '')
                        : ''
                    FrameModel.findOne({netsuiteId: frame}, function (err, frameObj) {
                        if (err) {
                            return reject(err)
                        }
                        frame = !frameObj ? null : frameObj._id
                        EngineModel.findOne({netsuiteId: engine}, function (err, engineObj) {
                            if (err) {
                                return reject(err)
                            }
                            engine = !engineObj ? null : engineObj._id
                            resolve({
                                isSynced:         true,
                                number:           ele.columns.name,
                                engineHP:         ele.columns.custrecord_enginehp
                                                      ? ele.columns.custrecord_enginehp
                                                      : 0,
                                assignedTo:       assignedTo ? assignedTo : null,
                                productSeries:    comptype,
                                locationName:     ele.columns.hasOwnProperty('custrecord_leasename')
                                                      ? ele.columns.custrecord_leasename
                                                      : '',
                                legalDescription: ele.columns.hasOwnProperty('custrecord_legaldescription')
                                                      ? ele.columns.custrecord_legaldescription
                                                      : '',
                                netsuiteId:       ele.id,
                                customerName:     customerName,
                                geo:              {type: 'Point', coordinates},
                                engineSerial:     ele.columns.hasOwnProperty('custrecord_engine_serial_asset_level')
                                                      ? ele.columns.custrecord_engine_serial_asset_level
                                                      : '',
                                compressorSerial: ele.columns.hasOwnProperty('custrecord_compressor_serial_asset_level')
                                                      ? ele.columns.custrecord_compressor_serial_asset_level
                                                      : '',
                                county:           county ? county : null,
                                state:            state ? state : null,
                                // Pm info
                                status:           ele.columns.custrecord_unitstatus.name,
                                pmCycle:          ele.columns.hasOwnProperty('custrecord_pmcycletime')
                                                      ? ele.columns.custrecord_pmcycletime.name
                                                      : '',
                                nextPmDate:       ele.columns.hasOwnProperty('custrecord_scd_latest_next_pmdate')
                                                      ? new Date(ele.columns.custrecord_scd_latest_next_pmdate)
                                                      : null,
                                nextPM1Date:      ele.columns.hasOwnProperty('custrecord_next_pm1_date')
                                                      ? new Date(ele.columns.custrecord_next_pm1_date)
                                                      : null,
                                nextPM2Date:      ele.columns.hasOwnProperty('custrecord_next_pm2_date')
                                                      ? new Date(ele.columns.custrecord_next_pm2_date)
                                                      : null,
                                nextPM3Date:      ele.columns.hasOwnProperty('custrecord_next_pm3_date')
                                                      ? new Date(ele.columns.custrecord_next_pm3_date)
                                                      : null,
                                nextPM4Date:      ele.columns.hasOwnProperty('custrecord_next_pm4_date')
                                                      ? new Date(ele.columns.custrecord_next_pm4_date)
                                                      : null,
                                nextPM5Date:      ele.columns.hasOwnProperty('custrecord_next_pm5_date')
                                                      ? new Date(ele.columns.custrecord_next_pm5_date)
                                                      : null,
                                frameModel:       frame,
                                engineModel:      engine,
                            })
                        })
                    })
                });
            });
        });
    });
};

const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        Unit.findOneAndUpdate(
            {number: doc.number},
            doc,
            {upsert: true, new: true}).exec((err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

const removeNotSynced = () => {
    return new Promise((resolve, reject) => {
        Unit.remove({isSynced: false}).exec((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

module.exports = function () {
    return new Promise((resolve, reject) => {
        let docs;
        let FormattedDocs;
        let FormattedUnits;
        let returnData;
        let promises = []
        urls.forEach((url) => {
            promises.push(queryUnits(url))
        })
        docs = []
        Promise.all(promises)
               .then((res) => {
                   res.forEach((response) => {
                       docs.push(...response)
                   })
                   return updateSyncedFalse()
               })
               .then(() => {
                   return Promise.all(docs.map((d) => unitFormat(d)))
               })
               .then((formattedUnitObjects) => {
                   FormattedDocs = formattedUnitObjects
                   return Unit.find({})
                              .exec()
               })
               .then((units) => {
                   FormattedUnits = units.map((u) => formatUnit(u))
                   return addChangeLog(FormattedDocs, FormattedUnits)
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
