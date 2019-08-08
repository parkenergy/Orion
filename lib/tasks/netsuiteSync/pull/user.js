const User = require('../../../models/user.js')
const TH = require('../../../helpers/task_helper')
const TBA = require('../../../helpers/tokenBasedAuthentication')
const {isEmpty} = require('tedb-utils')

const userSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=employee&id=97';

const queryUsers = () => {
    return new Promise((resolve, reject) => {
        let backoff = 200
        let retries = 8
        const makeCall = (repeats) => {
            const usersLink = new TBA(userSearchUrl)
            usersLink.getRequest(97,
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

const addChangeLog = (docs, users) => {
    return new Promise((resolve, reject) => {
        const changes = [];
        users.forEach((user) => {
            let found = false;
            docs.forEach((doc) => {
                if (doc.netsuiteId === user.netsuiteId) {
                    found = true;
                    changes.push({diff: diff(user, doc), old: user.netsuiteId, newDoc: doc.netsuiteId});
                }
            });
            if (!found) {
                changes.push({diff: 'removed', old: user.netsuiteId, newDoc: null});
            }
        });
        docs.forEach((doc) => {
            let found = false;
            users.forEach((user) => {
                if (doc.netsuiteId === user.netsuiteId) {
                    found = true;
                }
            });
            if (!found) {
                changes.push({diff: 'added', old: null, newDoc: doc.netsuiteId});
            }
        });
        const changeObj = {
            name: 'Users',
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
        User.update({isSynced: true}, {isSynced: false}, {multi: true}, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

const formatUser = (user) => {
    return {
        isSynced:     true,
        firstName:    user.firstName,
        lastName:     user.lastName,
        username:     user.username,
        email:        user.email === '' ? null : user.email ? user.email : null,
        supervisor:   user.supervisor,
        role:         user.role,
        area:         user.area,
        areaId:       user.areaId,
        location:     user.location,
        netsuiteId:   user.netsuiteId,
        activeStatus: user.activeStatus
    };
};

const userFormat = (ele) => {
    return {
        isSynced:     true,
        firstName:    ele.columns.firstname,
        lastName:     ele.columns.lastname,
        username:     ele.columns.entityid,
        email:        ele.columns.email === '' ? null : ele.columns.email ? ele.columns.email : null,
        supervisor:   ele.columns.supervisor ? ele.columns.supervisor.name : null,
        role:         ele.columns.custentity_orion_administrator ? 'admin' :
                      (ele.columns.custentity_field_service_manager ? 'manager' : 'tech'),
        area:         ele.columns.hasOwnProperty("class") ? ele.columns.class.name : "",
        areaId:       ele.columns.hasOwnProperty("class") ? ele.columns.class.internalid : "",
        location:     ele.columns.location ? (ele.columns.location.name ? ele.columns.location.name : '') : '',
        netsuiteId:   ele.id,
        activeStatus: ele.columns.isinactive
    };
};

const findAndUpdate = (doc) => {
    return new Promise((resolve, reject) => {
        if (doc.email === null) {
            doc.email = "";
        }
        User.findOneAndUpdate(
            {netsuiteId: doc.netsuiteId},
            doc,
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
        User.update({isSynced: false}, {activeStatus: true}, {multi: true},
            (err) => {
                if (err) return reject(err);
                resolve();
            });
    });
};

module.exports = function () {
    return new Promise((resolve, reject) => {
        let docs;
        let FormattedDocs;
        let FormattedUsers;
        let returnData;
        queryUsers()
            .then((res) => {
                docs = res
                return updateSyncedFalse()
            })
            .then(() => User.find({})
                            .exec())
            .then((users) => {
                FormattedDocs = docs.map((d) => userFormat(d))
                FormattedUsers = users.map((u) => formatUser(u))
                return TH.addChangeLogUser(FormattedDocs, FormattedUsers)
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
    });
};
