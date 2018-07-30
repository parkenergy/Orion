const User = require('../../models/user.js');
const ChangeLog = require('../../models/changeLog');
const TH = require('../../helpers/task_helper');
const axios = require('axios');
const {diff} = require('deep-diff');

const userSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=employee&id=97';
const options = {
    headers: {
        'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~ParkEnergy2018~',
        'User-Agent':    'SuiteScript-Call',
        'Content-Type':  'application/json'
    }

};

const queryUsers = (url, headerOptions) => {
    return new Promise((resolve, reject) => {
        axios.get(url, {
                headers: headerOptions.headers
            })
            .then(resolve)
            .catch(reject);
    });
};

/*const addChangeLog = (docs, users) => {
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
};*/

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
        isSynced: true,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email === '' ? null : user.email ? user.email : null,
        supervisor: user.supervisor,
        role: user.role,
        area: user.area,
        areaId: user.areaId,
        location: user.location,
        netsuiteId: user.netsuiteId,
    };
};

const userFormat = (ele) => {
    return {
        isSynced: true,
        firstName: ele.columns.firstname,
        lastName: ele.columns.lastname,
        username: ele.columns.entityid,
        email: ele.columns.email === '' ? null : ele.columns.email ? ele.columns.email : null,
        supervisor: ele.columns.supervisor ? ele.columns.supervisor.name : null,
        role: ele.columns.custentity_orion_administrator ? 'admin' : (ele.columns.custentity_field_service_manager ? 'manager' : 'tech'),
        area: ele.columns.hasOwnProperty("class") ? ele.columns.class.name : "",
        areaId: ele.columns.hasOwnProperty("class") ? ele.columns.class.internalid : "",
        location: ele.columns.location ? (ele.columns.location.name ? ele.columns.location.name : '') : '',
        netsuiteId: ele.id,
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
            {upsert: true, new: true}).exec((err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

const removeNotSynced = () => {
    return new Promise((resolve, reject) => {
        User.remove({isSynced: false}).exec((err) => {
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
        queryUsers(userSearchUrl, options)
            .then((res) => {
                docs = res.data;
                return updateSyncedFalse();
            })
            .then(() => User.find({}).exec())
            .then((users) => {
                FormattedDocs = docs.map((d) => userFormat(d));
                FormattedUsers = users.map((u) => formatUser(u));
                return TH.addChangeLogUser(FormattedDocs, FormattedUsers);
            })
            .then(() => {
                const promises = [];
                FormattedDocs.forEach((fd) => promises.push(findAndUpdate(fd)));
                return Promise.all(promises);
            })
            .then((res) => {
                returnData = res;
                return removeNotSynced();
            })
            .then(() => {
                resolve(returnData);
            })
            .catch(reject);
    });
};
