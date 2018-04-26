'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  Promise       = require('bluebird'),
  SyncData      = require('../models/syncData'),
  ChangeLog     = require('../models/changeLog'),
  log           = require('../helpers/logger');

const changeLogArrayPush = (changeObj, changeLog, name) => {
  changeLog[name].forEach((add) => {
    if (changeObj[changeLog.name][name].indexOf(add) === -1 && add !== null) {
      changeObj[changeLog.name][name].push(add);
    }
  });
};

module.exports = function (changeLogSchema) {

  changeLogSchema.createDoc = function (data) {
    const dataArr = [].concat(data);
    return new Promise( (resolve, reject) => {
      this.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  changeLogSchema.statics.updateDoc = function (id, data) {
    return new Promise( (resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);
      this.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  changeLogSchema.statics.fetch = function (id) {
    return new Promise( (resolve, reject) => {
      this.findOne({_id: id})
        .lean()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  changeLogSchema.statics.list = function (options) {
    return new Promise((resolve, reject) => {
      let q = {};
      if (options.from) {
        q.changeMade = {
          $gte: options.from,
          $lte: options.to || new Date(),
        };
      }

      const sort = options.sort || '-changeMade';

      this.find(q)
        .skip(options.skip)
        .limit(options.limit)
        .sort(sort)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  changeLogSchema.statics.delete = function(id) {
    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);
      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  /**
   * Here is where the return object is created.
   *
   * If no change logs found within time frame resolve with null
   *
   * If there are but it is over a month of changes then return
   * each collection in the object with added set to [null]
   *
   * If some are found then add them to the object with their
   * changed nsids to appropriate changeLog object.
   *
   * @param username
   * @param hostName
   * @param compUser
   * @returns {bluebird}
   */
  changeLogSchema.statics.getClientSyncItems = function(username, hostName, compUser) {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const month = 60000 * 60 * 24 * 31; // 1 month milli
      // get last sync from user
      SyncData.lastForTech({username})
        .then((lastSync) => {
          if (lastSync === null || hostName !== lastSync.hostName || compUser !== lastSync.compUser) {
            // sync all
            return new Promise((res) => res(false))
          } else {
            if ((now.getTime() - new Date(lastSync.date).getTime()) > month) {
              console.log('greater than a month')
              // sync all
              return new Promise((res) => res(false))
            } else {
              console.log('not greater than a month')
              // sync changes
              // return new Promise((res) => res(false))
              return this.find({changeMade: {$gte: new Date(lastSync.date)}}).exec();
            }
          }
        })
        .then((res) => {
          const changeObj = {};
          // res is all the changeLogs or null
          if (!res) {
            // got undefined in response - sync all
            resolve(false);
          } else {
            res.forEach((changeLog) => {
              if (!changeObj[changeLog.name]) {
                changeObj[changeLog.name] = {
                  name: changeLog.name,
                  added: changeLog.added.filter((x) => x !== null),
                  changed: changeLog.changed.filter((x) => x !== null),
                  removed: changeLog.removed.filter((x) => x !== null),
                };
              } else {
                changeLogArrayPush(changeObj, changeLog, 'added');
                changeLogArrayPush(changeObj, changeLog, 'changed');
                changeLogArrayPush(changeObj, changeLog, 'removed');
              }
            });
          }
          resolve(changeObj);
        })
        .catch(reject)
    });
  };
};
