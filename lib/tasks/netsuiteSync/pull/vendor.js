const axios = require("axios");
const Vendor = require("../../../models/vendor");
const ChangeLog = require("../../../models/changeLog");
const { diff } = require("deep-diff");
const TBA = require("../../../helpers/tokenBasedAuthentication");
const { isEmpty } = require("tedb-utils");

const vendorSearchUrl =
    "https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=248&deploy=1&recordtype=vendor&id=276";

const queryVendors = () => {
    return new Promise((resolve, reject) => {
        let backoff = 5000;
        let retries = 4;
        const makeCall = (repeats) => {
            const vendorLink = new TBA(vendorSearchUrl);
            vendorLink.getRequest(
                276,
                (body) => {
                    body = JSON.parse(body);
                    if (!isEmpty(body) && !isEmpty(body.error)) {
                        const error_message =
                            body.error.code || JSON.stringify(body);
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
                                return reject(body.error);
                            }
                        } else {
                            return reject(body.error);
                        }
                    } else {
                        resolve(body);
                    }
                },
                (error) => {
                    console.log(error);
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
                }
            );
        };
        makeCall(retries);
    });
};

const addChangeLog = (docs, vendors) => {
    return new Promise((resolve, reject) => {
        const changes = [];
        vendors.forEach((vendor) => {
            let found = false;
            docs.forEach((doc) => {
                if (doc.netsuiteId === vendor.netsuiteId) {
                    found = true;
                    changes.push({
                        diff: diff(vendor, doc),
                        old: vendor.netsuiteId,
                        newDoc: doc.netsuiteId,
                    });
                }
            });
            if (!found) {
                changes.push({
                    diff: "removed",
                    old: vendor.netsuiteId,
                    newDoc: null,
                });
            }
        });
        docs.forEach((doc) => {
            let found = false;
            vendors.forEach((vendor) => {
                if (doc.netsuiteId === vendor.netsuiteId) {
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
            name: "Vendors",
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
        Vendor.update(
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

const formatVendor = (vendor) => {
    return {
        isSynced: true,
        netsuiteId: vendor.netsuiteId,
        name: vendor.name,
        phone: vendor.phone,
        email: vendor.email,
        isCounterOrderType: vendor.isCounterOrderType,
        primaryContact: vendor.primaryContact,
        category: vendor.category,
        activeStatus: vendor.activeStatus,
    };
};

const vendorFormat = (ele) => {
    const phone = ele.columns.hasOwnProperty("phone") ? ele.columns.phone : "";
    const category = ele.columns.hasOwnProperty("category")
        ? ele.columns.category.hasOwnProperty("name")
            ? ele.columns.category.name
            : ""
        : "";
    const email = ele.columns.hasOwnProperty("email") ? ele.columns.email : "";
    const contact = ele.columns.hasOwnProperty("contact")
        ? ele.columns.contact.hasOwnProperty("name")
            ? ele.columns.contact.name
            : ""
        : "";
    const isCounterOrderType = ele.columns.custentity_counter_order_type;
    return {
        isSynced: true,
        netsuiteId: ele.id,
        name: ele.columns.entityid,
        phone: phone,
        isCounterOrderType: isCounterOrderType,
        email: email,
        primaryContact: contact,
        category: category,
        activeStatus: ele.columns.isinactive,
    };
};

const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        Vendor.findOneAndUpdate(
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
        Vendor.update(
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
        let FormattedVendors;
        let returnData;
        queryVendors()
            .then((res) => {
                docs = res.map((result) => {
                    if (result && result.columns && result.columns.internalid)
                        return result;

                    return {
                        ...result,
                        recordtype: result.recordType,
                        columns: {
                            ...result.values,
                            internalid: {
                                name: result.id,
                                internalid: result.id,
                            },
                        },
                        values: undefined,
                    };
                });
                return updateSyncedFalse();
            })
            .then(() => Vendor.find({}).exec())
            .then((vendors) => {
                FormattedDocs = docs.reduce((acc, d) => {
                    if (d.id !== "-3") {
                        return acc.concat(vendorFormat(d));
                    } else {
                        return acc;
                    }
                }, []);
                FormattedVendors = vendors.map((v) => formatVendor(v));
                return addChangeLog(FormattedDocs, FormattedVendors);
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
