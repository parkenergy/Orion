const log = require('../../helpers/logger');
const User = require('../../models/user.js');
const ChangeLog = require('../../models/changeLog');
const axios = require('axios');
const diff = require('deep-diff').diff;
let exec = require('child_process').exec,
    child;

const userSearchUrl = 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=91&deploy=1&recordtype=employee&id=97';
const options = {
        headers: {  'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
                    'User-Agent' : 'SuiteScript-Call',
                    'Content-Type' : 'application/json'
        }

};

const queryUsers = (url, headerOptions) => {
  return axios.get(url, {
    headers: headerOptions.headers
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
    const changeObj = {
      name: 'Users',
      changed: [],
      removed: [],
      changeMade: new Date(),
    };
    changes.forEach((change) => {
      if (change.diff === 'removed') {
        changeObj.removed.push(change.old);
      }
      if (change.diff !== undefined && change.diff !== 'removed') {
        changeObj.changed.push(change.newDoc);
      }
    });
    if (changeObj.changed.length === 0 && changeObj.removed.length === 0) {
      resolve();
    } else {
      new ChangeLog(changeObj).save((err) => {
        if (err) return reject(err);
        resolve();
      })
    }
  });
};

const updateSyncedFalse = () => {
  return new Promise((resolve) => {
    User.update({isSynced: true}, {isSynced: false}, {multi: true}, () => {
      resolve();
    })
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
    location: user.location,
    netsuiteId: user.netsuiteId,
  }
};

const userFormat = (ele) => {
  ele.columns.supervisor = ele.columns.supervisor ? ele.columns.supervisor : ele.columns.supervisor = {name: null};
  ele.columns.location = ele.columns.location ? (ele.columns.location.name ? ele.columns.location.name : '') : '';

  return {
    isSynced: true,
    firstName: ele.columns.firstname,
    lastName: ele.columns.lastname,
    username: ele.columns.entityid,
    email: ele.columns.email === '' ? null : ele.columns.email ? ele.columns.email : null,
    supervisor: ele.columns.supervisor.name,
    role: ele.columns.custentity_orion_administrator ? 'admin' : (ele.columns.custentity_field_service_manager ? 'manager' : 'tech'),
    area: ele.columns.hasOwnProperty("class") ? ele.columns.class.name : "",
    location: ele.columns.location,
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
        if(err) return reject(err);
        resolve(data);
      })
  });
};

const removeNotSynced = () => {
  return new Promise((resolve, reject) => {
    User.remove({isSynced: false}).exec((err) => {
      if (err) return reject(err);
      resolve();
    })
  });
};

const getUsers = (callback) => {
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
      return addChangeLog(FormattedDocs, FormattedUsers);
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
      callback(null, returnData);
    })
    .catch((err) => {
      callback(err);
    })
};

module.exports = getUsers;
