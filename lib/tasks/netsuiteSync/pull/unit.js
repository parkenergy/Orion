const Unit = require("../../../models/unit.js");
const County = require("../../../models/county.js");
const State = require("../../../models/state.js");
const User = require("../../../models/user.js");
const FrameModel = require("../../../models/frameModel");
const EngineModel = require("../../../models/engineModel");
const ChangeLog = require("../../../models/changeLog");
const log = require("../../../helpers/logger");
const { diff } = require("deep-diff");
const TBA = require("../../../helpers/tokenBasedAuthentication");
const { isEmpty } = require("tedb-utils");

// The urls and and headers required to send http requests to netsuite
const unitSearchUrl1 = {
    url:
        "https://4086435.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=248&deploy=1&recordtype=customrecord_ncfar_asset&id=91",
    id: 91,
};

const urls = [unitSearchUrl1];

const queryUnits = (obj) => {
    return new Promise((resolve, reject) => {
        let backoff = 5000;
        let retries = 4;
        const makeCall = (repeats) => {
            const unitLink = new TBA(obj.url);
            unitLink.getRequest(
                obj.id,
                (res) => {
                    res = JSON.parse(res);
                    log.info('testing unit.js'); 
                    if (!isEmpty(res) && !isEmpty(res.error)) {
                        const error_message =
                            res.error.code || JSON.stringify(res);
                         log.info(error_message); 
                        if (
                            [
                                "ECONNRESET",
                                "ESOCKETTIMEDOUT",
                                "ETIMEDOUT",
                                "SSS_REQUEST_LIMIT_EXCEEDED",
                            ].indexOf(error_message) !== -1
                        ) {
                            if (repeats > 0) {
                                if (backoff && retries) {
                                    setTimeout(() => {
                                        makeCall(repeats - 1);
                                    }, backoff * (retries - (repeats + 1)));
                                } else {
                                    makeCall(repeats - 1);
                                }
                            } else {
                                return reject(res);
                            }
                        } else {
                            return reject(res);
                        }
                    } else {
                        resolve(res);
                    }
                },
                (error) => {
                    if (!isEmpty(error.error)) {
                        const error_message =
                            error.error.code || JSON.stringify(error);
                        log.info(error_message);
                        if (
                            [
                                "ECONNRESET",
                                "ESOCKETTIMEDOUT",
                                "ETIMEDOUT",
                                "SSS_REQUEST_LIMIT_EXCEEDED",
                            ].indexOf(error_message) !== -1
                        ) {
                            if (repeats > 0) {
                                if (backoff && retries) {
                                    setTimeout(() => {
                                        makeCall(repeats - 1);
                                    }, backoff * (retries - (repeats + 1)));
                                } else {
                                    makeCall(repeats - 1);
                                }
                            } else {
                                reject(error);
                            }
                        } else {
                            reject(error);
                        }
                    } else {
                        reject(error);
                    }
                }
            );
        };
        makeCall(retries);
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
                    changes.push({
                        diff: diff(unit, doc),
                        old: unit.netsuiteId,
                        newDoc: doc.netsuiteId,
                    });
                }
            });
            if (!found) {
                changes.push({
                    diff: "removed",
                    old: unit.netsuiteId,
                    newDoc: null,
                });
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
                changes.push({
                    diff: "added",
                    old: null,
                    newDoc: doc.netsuiteId,
                });
            }
        });
        const changeObj = {
            name: "Units",
            added: [],
            changed: [],
            removed: [],
            changeMade: new Date(),
        };
        changes.forEach((change) => {
            if (change.diff === "removed") {
                changeObj.removed.push(change.old);
            }
            if (change.diff === "added") {
                changeObj.added.push(change.newDoc);
            }
            if (
                change.diff !== undefined &&
                change.diff !== "removed" &&
                change.diff !== "added"
            ) {
                changeObj.changed.push(change.newDoc);
            }
        });
        if (
            changeObj.changed.length === 0 &&
            changeObj.removed.length === 0 &&
            changeObj.added.length === 0
        ) {
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
        Unit.update(
            { isSynced: true },
            { isSynced: false },
            { multi: true },
            (err) => {
                if (err) return reject(err);
                resolve();
            }
        );
    });
};

const formatUnit = (unit) => {
    log.info(unit.number);            ///  Testing
    return {
        isSynced: true,
        number: unit.number,
        assignedTo: unit.assignedTo,
        productSeries: unit.productSeries,
        sku: unit.sku,
        locationName: unit.locationName,
        legalDescription: unit.legalDescription,
        netsuiteId: unit.netsuiteId,
        customerName: unit.customerName,
        geo: {
            type: "Point",
            coordinates: unit.geo.coordinates,
        },
        engineSerial: unit.engineSerial,
        compressorSerial: unit.compressorSerial,
        county: unit.county ? unit.county._id : null,
        state: unit.state ? unit.state._id : null,
        status: unit.status,
        pmCycle: unit.pmCycle,
        nextPmDate: unit.nextPmDate,
        engineHP: unit.engineHP,
        frameModel: unit.frameModel ? unit.frameModel : "",
        engineModel: unit.engineModel ? unit.engineModel : "",
        nextPM1Date: unit.nextPM1Date,
        nextPM2Date: unit.nextPM2Date,
        nextPM3Date: unit.nextPM3Date,
        nextPM4Date: unit.nextPM4Date,
        nextPM5Date: unit.nextPM5Date,
        activeStatus: unit.activeStatus,
    };
};

const getEngineModel = (engine) => {
    return new Promise((resolve, reject) => {
        EngineModel.findOne({ netsuiteId: engine }, function (err, engineObj) {
            if (err) {
                return resolve("");
            }
            const foundEngine = !engineObj ? null : engineObj.netsuiteId;
            resolve(foundEngine);
        });
    });
};

const getFrameModel = (frame) => {
    return new Promise((resolve, reject) => {
        FrameModel.findOne({ netsuiteId: frame }, function (err, frameObj) {
            if (err) {
                return resolve("");
            }
            const foundFrame = !frameObj ? null : frameObj.netsuiteId;
            resolve(foundFrame);
        });
    });
};
const getCounty = (county, stateObjID) => {
    return new Promise((resolve, reject) => {
        County.findOne(
            {
                name: { $regex: new RegExp(`^${county}`, "i") },
                state: stateObjID,
            },
            function (err, countyObj) {
                if (err) {
                    return resolve("");
                }
                const foundCounty = !countyObj ? null : countyObj._id;
                resolve(foundCounty);
            }
        );
    });
};
const getState = (state) => {
    return new Promise((resolve, reject) => {
        State.findOne(
            { name: { $regex: new RegExp(`^${state}`, "i") } },
            function (err, stateObj) {
                if (err) {
                    return resolve("");
                }
                const foundState = !stateObj ? null : stateObj._id;
                resolve(foundState);
            }
        );
    });
};
const getUser = (nsUserId) => {
    return new Promise((resolve, reject) => {
        User.findOne({ netsuiteId: nsUserId }, function (err, user) {
            if (err) {
                return reject(err);
            }
            const assignedTo = user ? user.username : null;
            resolve(assignedTo);
        });
    });
};

async function getAsyncUnitInfo(engine, frame, county, state, nsUserId) {
    const engineNSID = await getEngineModel(engine);
    const frameNSID = await getFrameModel(frame);
    const stateObjID = await getState(state);
    const countyObjID = await getCounty(county, stateObjID);
    const username = await getUser(nsUserId);
    return {
        engineNSID,
        frameNSID,
        countyObjID,
        stateObjID,
        username,
    };
}

const unitFormat = (ele) => {
    return new Promise((resolve, reject) => {
        let coordinates;
        let frame;
        let engine;
        let county;
        let state;
        let nsUserId;
        let customerName = "";
        let sku = "";
        if (
            ele.columns.hasOwnProperty("custrecord_fw_longitude") &&
            ele.columns.hasOwnProperty("custrecord_fw_latitude")
        ) {
            if (
                ele.columns.custrecord_fw_longitude &&
                ele.columns.custrecord_fw_latitude
            ) {
                coordinates = [
                    +ele.columns.custrecord_fw_longitude,
                    +ele.columns.custrecord_fw_latitude,
                ];
            } else {
                coordinates = [0.0, 0.0];
            }
        } else {
            coordinates = [0.0, 0.0];
        }
        if (ele.columns.hasOwnProperty("custrecord_framemodel")) {
            if (
                ele.columns.custrecord_framemodel.hasOwnProperty("internalid")
            ) {
                frame = ele.columns.custrecord_framemodel.internalid;
            }
        }
        if (ele.columns.hasOwnProperty("custrecord_engine_model")) {
            if (
                ele.columns.custrecord_engine_model.hasOwnProperty("internalid")
            ) {
                engine = ele.columns.custrecord_engine_model.internalid;
            }
        }
        if (ele.columns.hasOwnProperty("custrecord_sku")) {
            sku = ele.columns.custrecord_sku.name
                ? ele.columns.custrecord_sku.name.toUpperCase()
                : "";
        }

        if (ele.columns.hasOwnProperty("custrecord_assetcountylocation")) {
            county = ele.columns.custrecord_assetcountylocation;
        }
        if (ele.columns.hasOwnProperty("custrecord_state")) {
            state = ele.columns.custrecord_state.name
                ? ele.columns.custrecord_state.name
                : "";
        }

        if (ele.columns.hasOwnProperty("custrecord_assignedtech")) {
            nsUserId = ele.columns.custrecord_assignedtech.internalid;
        }
        if (ele.columns.hasOwnProperty("CUSTRECORD_ASSET_CUSTOMER.altname")) {
            if (ele.columns["CUSTRECORD_ASSET_CUSTOMER.altname"]) {
                // old
                // ele.columns.custrecord_asset_customer.name
                // used to say unit is Compressor in the future * TODO
                customerName = ele.columns["CUSTRECORD_ASSET_CUSTOMER.altname"];
            }
        }
        const comptype = ele.columns.hasOwnProperty("custrecord_comptype")
            ? ele.columns.custrecord_comptype.hasOwnProperty("name")
                ? ele.columns.custrecord_comptype.name
                : ""
            : "";
        nsUserId = !nsUserId ? 0 : nsUserId;
        getAsyncUnitInfo(engine, frame, county, state, nsUserId)
            .then((res) => {
                resolve({
                    isSynced: true,
                    number: ele.columns.name.toUpperCase(),
                    engineHP: ele.columns.custrecord_enginehp
                        ? ele.columns.custrecord_enginehp
                        : 0,
                    assignedTo: res.username ? res.username : null,
                    productSeries: comptype,
                    sku: sku,
                    locationName:
                        ele.columns.hasOwnProperty("custrecord_leasename") &&
                        ele.columns.custrecord_leasename !== undefined
                            ? ele.columns.custrecord_leasename.toUpperCase()
                            : "",
                    legalDescription:
                        ele.columns.hasOwnProperty(
                            "custrecord_legaldescription"
                        ) &&
                        ele.columns.custrecord_legaldescription !== undefined
                            ? ele.columns.custrecord_legaldescription.toUpperCase()
                            : "",
                    netsuiteId: ele.id,
                    customerName: customerName.toUpperCase(),
                    geo: {
                        type: "Point",
                        coordinates,
                    },
                    engineSerial:
                        ele.columns.hasOwnProperty(
                            "custrecord_engine_serial_asset_level"
                        ) &&
                        ele.columns.custrecord_engine_serial_asset_level !==
                            undefined
                            ? ele.columns.custrecord_engine_serial_asset_level
                            : "",
                    compressorSerial:
                        ele.columns.hasOwnProperty(
                            "custrecord_compressor_serial_asset_level"
                        ) &&
                        ele.columns.custrecord_compressor_serial_asset_level !==
                            undefined
                            ? ele.columns
                                  .custrecord_compressor_serial_asset_level
                            : "",
                    county: res.countyObjID ? res.countyObjID : null,
                    state: res.stateObjID ? res.stateObjID : null,
                    // Pm info
                    status: ele.columns.custrecord_unitstatus.name,
                    pmCycle:
                        ele.columns.hasOwnProperty("custrecord_pmcycletime") &&
                        ele.columns.custrecord_pmcycletime !== ""
                            ? ele.columns.custrecord_pmcycletime.name
                            : "",
                    nextPmDate:
                        ele.columns.hasOwnProperty(
                            "custrecord_scd_latest_next_pmdate"
                        ) &&
                        ele.columns.custrecord_scd_latest_next_pmdate !==
                            undefined
                            ? new Date(
                                  ele.columns.custrecord_scd_latest_next_pmdate
                              )
                            : null,
                    nextPM1Date:
                        ele.columns.hasOwnProperty(
                            "custrecord_next_pm1_date"
                        ) && ele.columns.custrecord_next_pm1_date !== ""
                            ? new Date(ele.columns.custrecord_next_pm1_date)
                            : null,
                    nextPM2Date:
                        ele.columns.hasOwnProperty(
                            "custrecord_next_pm2_date"
                        ) && ele.columns.custrecord_next_pm2_date !== ""
                            ? new Date(ele.columns.custrecord_next_pm2_date)
                            : null,
                    nextPM3Date:
                        ele.columns.hasOwnProperty(
                            "custrecord_next_pm3_date"
                        ) && ele.columns.custrecord_next_pm3_date !== ""
                            ? new Date(ele.columns.custrecord_next_pm3_date)
                            : null,
                    nextPM4Date:
                        ele.columns.hasOwnProperty(
                            "custrecord_next_pm4_date"
                        ) && ele.columns.custrecord_next_pm4_date !== ""
                            ? new Date(ele.columns.custrecord_next_pm4_date)
                            : null,
                    nextPM5Date:
                        ele.columns.hasOwnProperty(
                            "custrecord_next_pm5_date"
                        ) && ele.columns.custrecord_next_pm5_date !== ""
                            ? new Date(ele.columns.custrecord_next_pm5_date)
                            : null,
                    frameModel: res.frameNSID
                        ? res.frameNSID.toUpperCase()
                        : "",
                    engineModel: res.engineNSID
                        ? res.engineNSID.toUpperCase()
                        : "",
                    activeStatus: ele.columns.isinactive,
                });
            })
            .catch(reject);
    });
};

const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        Unit.findOneAndUpdate(
            { netsuiteId: doc.netsuiteId },
            doc,
            {
                upsert: true,
                new: true,
            },
            (err, data) => {
                if (err) return reject(err);
                resolve(data);
            }
        );
    });
};

const setNotSyncedToInactive = () => {
    return new Promise((resolve, reject) => {
        Unit.update(
            { isSynced: false },
            { activeStatus: true },
            { multi: true },
            (err) => {
                if (err) return reject(err);
                resolve();
            }
        );
    });
};

module.exports = function () {
    return new Promise((resolve, reject) => {
        let docs;
        let FormattedDocs;
        let FormattedUnits;
        let returnData;
        let promises = [];
        urls.forEach((url) => {
            promises.push(queryUnits(url));
        });
        docs = [];
        Promise.all(promises)
            .then((res) => {
                res.forEach((response) => {
                    response = response.map((result) => {
                        if (
                            result &&
                            result.columns &&
                            result.columns.internalid
                        )
                            return result;

                        const keys = Object.keys(result.values);
                        const columns = keys.reduce((obj, key) => {
                            const objVal = result.values[key];
                            if (Array.isArray(objVal) && objVal.length > 0) {
                                return {
                                    ...obj,
                                    [key]: {
                                        name: objVal[0].text,
                                        internalid: objVal[0].value,
                                    },
                                };
                            }
                            return {
                                ...obj,
                                [key]: objVal,
                            };
                        }, {});
                        return {
                            ...result,
                            recordtype: result.recordType,
                            columns: columns,
                            values: undefined,
                        };
                    });
                    docs.push(...response);
                });
                return updateSyncedFalse();
            })
            .then(() => {
                return Promise.all(docs.map((d) => unitFormat(d)));
            })
            .then((formattedUnitObjects) => {
                FormattedDocs = formattedUnitObjects;
                return Unit.find({}).exec();
            })
            .then((units) => {
                FormattedUnits = units.map((u) => formatUnit(u));
                return addChangeLog(FormattedDocs, FormattedUnits);
            })
            .then(() => {
                const promises = [];
                FormattedDocs.forEach((fd) => promises.push(findAndUpdate(fd)));
                return Promise.all(promises);
            })
            .then((res) => {
                returnData = res;
                return setNotSyncedToInactive();
            })
            .then(() => {
                resolve(returnData);
            })
            .catch(reject);
    });
};
