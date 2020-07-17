const Part = require("../../../models/part.js");
const TBA = require("../../../helpers/tokenBasedAuthentication");
const { isEmpty } = require("tedb-utils");
const ChangeLog = require("../../../models/changeLog");
const { diff } = require("deep-diff");

const partSearchUrl1 = {
    url:
        "https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=248&deploy=1&recordtype=item&id=90",
    id: 90,
};

const urls = [partSearchUrl1];

/**
 * Query the Parts based on url
 * @param obj
 * @returns {*}
 */
const queryParts = (obj) => {
    return new Promise((resolve, reject) => {
        let backoff = 5000;
        let retries = 4;
        const makeCall = (repeats) => {
            const partsLink = new TBA(obj.url);
            partsLink.getRequest(
                obj.id,
                (res) => {
                    res = JSON.parse(res);
                    if (!isEmpty(res) && !isEmpty(res.error)) {
                        const error_message =
                            res.error.code || JSON.stringify(res);
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

async function queryParts2(url, headerOptions) {
    try {
        const response = await axios.get(url, {
            headers: headerOptions.headers,
        });
        return response;
    } catch (e) {
        throw new Error(e);
    }
}

const addChangeLog = (docs, parts) => {
    return new Promise((resolve, reject) => {
        const changes = [];
        parts.forEach((part) => {
            let found = false;
            docs.forEach((doc) => {
                if (doc.netsuiteId === part.netsuiteId) {
                    found = true;
                    changes.push({
                        diff: diff(part, doc),
                        old: part.netsuiteId,
                        newDoc: doc.netsuiteId,
                    });
                }
            });
            if (!found) {
                changes.push({
                    diff: "removed",
                    old: part.netsuiteId,
                    newDoc: null,
                });
            }
        });
        docs.forEach((doc) => {
            let found = false;
            parts.forEach((part) => {
                if (doc.netsuiteId === part.netsuiteId) {
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
            name: "Parts",
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

/**
 * Update all isSynced Parts to isSynced False
 * @returns {Promise}
 */
const updateSyncedFalse = () => {
    return new Promise((resolve, reject) => {
        Part.update(
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

const formatPart = (part) => {
    return {
        isSynced: true,
        netsuiteId: part.netsuiteId,
        description: part.description,
        componentName: part.componentName,
        MPN: part.MPN,
        activeStatus: part.activeStatus,
    };
};

/**
 * Format incoming parts to the correct structure of the schema
 * @param ele
 * @returns {{netSuiteId, description: *, componentName: *, MPN: *}}
 */
const partFormant = (ele) => {
    return {
        isSynced: true,
        netsuiteId: +ele.id,
        description: ele.columns.salesdescription
            ? ele.columns.salesdescription
            : "",
        componentName: ele.columns.itemid ? ele.columns.itemid : "",
        MPN: ele.columns.mpn ? ele.columns.mpn : "",
        activeStatus: ele.columns.isinactive,
    };
};

/**
 * Find the part if it exists and update with the new information
 * which includes setting isSynced back to true. So when cleaning up
 * any unsynced parts are removed
 * @param doc
 * @returns {Promise}
 */
const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        Part.findOneAndUpdate(
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

/**
 * Remove all isSynced Parts that are false still
 * @returns {Promise}
 */
const setNotSyncedToInactive = () => {
    return new Promise((resolve, reject) => {
        Part.update(
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
        let docs = [];
        let FormattedDocs;
        let FormattedParts;
        let returnData;
        let promises = [];
        urls.forEach((url) => {
            promises.push(queryParts(url));
        });

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
            .then(() => Part.find({}).exec())
            .then((parts) => {
                FormattedDocs = docs.map((d) => partFormant(d));
                FormattedParts = parts.map((p) => formatPart(p));
                // FormattedParts = allParts.map((p) => formatPart(p));
                return addChangeLog(FormattedDocs, FormattedParts);
            })
            .then(() => {
                const updatePromises = [];
                FormattedDocs.forEach((fd) =>
                    updatePromises.push(findAndUpdate(fd))
                );
                return Promise.all(updatePromises);
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
