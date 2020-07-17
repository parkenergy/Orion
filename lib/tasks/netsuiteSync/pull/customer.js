const ChangeLog = require("../../../models/changeLog");
const { diff } = require("deep-diff");
const Customer = require("../../../models/customer");
const TBA = require("../../../helpers/tokenBasedAuthentication");
const { isEmpty } = require("tedb-utils");

let exec = require("child_process").exec,
    child;

const customerSearchUrl =
    "https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=248&deploy=1&recordtype=customer&id=64";

const queryCustomers = () => {
    return new Promise((resolve, reject) => {
        let backoff = 5000;
        let retries = 4;
        const makeCall = (repeats) => {
            const customerLink = new TBA(customerSearchUrl);
            customerLink.getRequest(
                51,
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

const addChangeLog = (docs, customers) => {
    return new Promise((resolve, reject) => {
        const changes = [];
        customers.forEach((customer) => {
            let found = false;
            docs.forEach((doc) => {
                if (doc.netsuiteId === customer.netsuiteId) {
                    found = true;
                    changes.push({
                        diff: diff(customer, doc),
                        old: customer.netsuiteId,
                        newDoc: doc.netsuiteId,
                    });
                }
            });
            if (!found) {
                changes.push({
                    diff: "removed",
                    old: customer.netsuiteId,
                    newDoc: null,
                });
            }
        });
        docs.forEach((doc) => {
            let found = false;
            customers.forEach((customer) => {
                if (doc.netsuiteId === customer.netsuiteId) {
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
            name: "Customers",
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
        Customer.update(
            { isSynced: true },
            { isSynced: false },
            { multi: true },
            function (err, raw) {
                if (err) {
                    return reject(err);
                }
                resolve();
            }
        );
    });
};

const formatCustomer = (customer) => {
    return {
        isSynced: true,
        name: customer.name,
        shortname: customer.shortname,
        netsuiteId: customer.netsuiteId,
        phone: customer.phone,
        email: customer.email,
        activeStatus: customer.activeStatus,
    };
};

const customerFormat = (ele) => {
    return {
        isSynced: true,
        shortname: ele.columns.entityid,
        name: ele.columns.altname,
        phone: ele.columns.phone ? ele.columns.phone : null,
        netsuiteId: ele.id,
        email: ele.columns.email ? ele.columns.email : null,
        activeStatus: ele.columns.isinactive,
    };
};

const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        Customer.findOneAndUpdate(
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
        Customer.update(
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

const getCustomers = () => {
    return new Promise((resolve, reject) => {
        let docs;
        let FormattedDocs;
        let FormattedCustomer;
        let returnData;
        queryCustomers()
            .then((res) => {
                docs = res.map((result) => {
                    if (result && result.columns && result.columns.internalid)
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
                return updateSyncedFalse();
            })
            .then(() => {
                return Customer.find({}).exec();
            })
            .then((customers) => {
                FormattedDocs = docs.map((d) => customerFormat(d));
                FormattedCustomer = customers.map((u) => formatCustomer(u));
                return addChangeLog(FormattedDocs, FormattedCustomer);
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

module.exports = getCustomers;
