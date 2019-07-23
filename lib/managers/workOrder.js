'use strict';

const ObjectId    = require('mongoose').Types.ObjectId,
      Unit        = require('../models/unit'),
      User        = require('../models/user'),
      PaidTimeOff = require('../models/paidTimeOff'),
      EditHistory = require('../models/editHistory'),
      _           = require('lodash'),
      log         = require('../helpers/logger'),
      woDump      = require('../databaseScripts/woDump'),
      payrollDump = require('../databaseScripts/payrollDump'),
      woPartsDump = require('../databaseScripts/woPartsDump'),
      ClientError = require('../errors/client'),
      AuthError   = require('../errors/auth'),
      nodemailer  = require('nodemailer'),
      GmailMailer = require('../helpers/email_helper'),
      WOSync      = require('../helpers/wo_SyncChecks'),
      woAdminSync = require('../helpers/wo_admindCreateSync'),
      ServerError = require('../errors/server');
const {diff} = require('deep-diff');
const {isEmpty, flattenArr} = require('tedb-utils')

module.exports = function (workOrderSchema) {

    workOrderSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {
            let dataArr = [].concat(data); //Ensure data is an array, cast single object to array
            //clean data
            dataArr.forEach((doc) => {
                delete doc._id;
                delete doc.__v;
            });
            let newArr = []
            const WOSYNC = new WOSync(this, dataArr, newArr)

            // need to bind this to method with in async calls?
            this.emailWO = this.emailWO.bind(this)

            WOSYNC.woCreateGetContentChecksum()
                  .then(WOSYNC.checkIsSyncStatus)
                  .then(WOSYNC.insertIncomingWOs)
                  .then(this.emailWO)
                  .then(WOSYNC.setUpInsertedWOsForSync)
                  .then((res) => {
                      log.info('Succesfully finished setUpInsertedWOsForSync')
                      return WOSync.setUpFormattedInsertedDocsWithSyncInfo(res)
                  })
                  .then((res) => {
                      log.info("successfully finished setUpFormattedInsertedDocsWithSyncInfo")
                      if (res.length > 0) {
                          return WOSYNC.ReTryAutoSyncAllToNetsuite(res, res.length - 1)
                      } else {
                          return res
                      }
                  })
                  .then((res) => {
                      log.info('finished RetryAutoSyncAllTONEtsuite')
                      return WOSYNC.formatObjsToUpdateObjsAndUpdate(res)
                  })
                  .then(resolve)
                  .catch((err) => {
                      log.error(`Error Occured during Orion Insert`)
                      reject(err)
                  })
        });
    };

    // create admind work order.
    // sync to ns then save again
    workOrderSchema.statics.createAdminDoc = function (data) {
        return new Promise((resolve, reject) => {
            const AdminsSync = new woAdminSync(this, data)
            AdminsSync.syncNewAdmindWorkOrder()
                      .then(resolve)
                      .catch(reject)
        })
    }

    //update single document
    workOrderSchema.statics.updateDoc = function (id, data, identity) {
        log.info({id}, "Update Doc");
        return new Promise((resolve, reject) => {
            if (!identity) return reject(new AuthError("Not authenticated"));
            if (typeof id === "string") id = ObjectId(id);

            if (data.netsuiteSyned && !data.timeSynced && !data.syncedBy) {
                log.trace({netsuiteSyned: data.netsuiteSyned, id}, "Is Submitting to netsuite?");

                this.findById(id)
                    .exec()
                    .then((doc) => {
                        if (doc.timeSynced && doc.syncedBy &&
                            doc.netsuiteSyned) throw new ClientError('Workorder Already Synced')
                        if (doc.type ===
                            'Indirect') throw new ClientError('Indirects Cannot Be Synced')
                        log.trace('Found document to sync');
                        return WOSync.syncToNetsuite(doc)
                        // // return syncToNetsuite(doc);
                    })
                    .then((doc) => {
                        log.trace('Update doc');
                        doc.updated_at = new Date();
                        if (!isEmpty(doc.netsuiteId) && doc.type !== 'Indirect') {
                            doc.timeSynced = new Date()
                            doc.syncedBy = identity.username
                        } else if (doc.type === 'Indirect') {
                            doc.timeSynced = new Date()
                            doc.syncedBy = identity.username
                        }
                        if (isEmpty(doc.netsuiteId) && doc.type !== 'Indirect') {
                            doc.netsuiteSyned = false
                        }
                        return this.findByIdAndUpdate(doc._id, doc,
                            {safe: false, new: true})
                            .lean()
                            .exec();
                    })
                    .then(resolve)
                    .catch(reject);
            } else {
                        return this.findByIdAndUpdate(id, data,
                            {safe: false, new: true})
                                   .lean()
                                   .exec()
                                   .then(resolve)
                                   .catch(reject);
            }
        });
    };

    /**
     * This method returns a Diff Object that contains the changes made
     * to the Workorder given the current state in mongodb and the new
     * incoming data
     *
     * Return Object array:
     *
     *
     *
     * @param id
     * @param newData
     * @param identity
     * @returns {Promise<any>}
     */
    workOrderSchema.statics.diff = function (id, newData, identity) {
        return new Promise((resolve, reject) => {
            if (!identity) return reject(new AuthError("Not Authenticated"));
            if (typeof id === "string") id = ObjectId(id);
            this.findById(id)
                .exec()
                .then((oldData) => {
                    if (oldData) {
                        oldData = JSON.parse(JSON.stringify(oldData));
                        if (typeof newData.technician ===
                            'object') newData.technician = oldData.technician;
                    }

                    return diff(oldData, newData) || [];
                })
                .then((r) => {
                    return r.map((change) => {
                        const type = change.kind === 'E' ? 'Edit' :
                            change.kind === 'A' ? 'Array' :
                                change.kind === 'N' ? 'Add' :
                                    change.kind === 'D' ? 'Delete' : null;
                        if (type === null) throw(new ServerError(
                            'Missing change type'));

                        return {
                            editType:  type,
                            user:      identity.username,
                            workOrder: id,
                            path:      change.path,
                            before:    change.lhs || null,
                            after:     change.rhs || null,
                        };
                    });
                })
                .then((res) => res.filter((edit) => {
                    return !((edit.path.length === 0) ||
                        (edit.path[0] === 'timePosted') ||
                        (edit.path[0] === 'comments') ||
                        (edit.path[0] === 'unit') ||
                        (edit.path[0] === '_id') ||
                        (edit.editType === 'Add') ||
                        (edit.path[3] === 'highlight') ||
                        (edit.path[0] === 'managerApproved') ||
                        (edit.path[0] === 'unitNumber'));
                }))
                .then((docs) => {
                    // log.trace(docs);
                    if (docs.length > 0) {
                        return EditHistory.insertMany(docs);
                    }
                    return docs;
                })
                .then(() => {
                    resolve(newData);
                })
                .catch(reject);
        });
    };

    /**
     * For Admins to make simple updates
     * @param id
     * @param doc
     * @param identity
     * @returns {Promise<any>}
     */
    workOrderSchema.statics.simpleUpdateAndApprove = function (id, doc, identity) {
        return new Promise((resolve, reject) => {
            if (!identity) return reject(new AuthError("Not authenticated"));
            if (typeof id === 'string') id = ObjectId(id);
            this.diff(id, doc, identity)
                .then((data) => {
                    const ApprovedData = this.returnApprovedDoc(data, identity);
                    return this.findByIdAndUpdate(id, ApprovedData,
                        {save: false, new: true})
                        .lean()
                        .exec();
                })
                .then(resolve)
                .catch(reject);
        });
    };

    /**
     * For when the manager approves a work order that has no
     * notes it is auto synced.
     * @param id
     * @param doc
     * @param identity
     */
    workOrderSchema.statics.UpdateToSync = function (id, doc, identity) {
        return new Promise((resolve, reject) => {
            if (!identity) return reject(new AuthError("Not authenticated"));
            if (typeof id === 'string') id = ObjectId(id);
            let approvedDoc = doc;
            if (!doc.managerApproved || !doc.timeApproved) {
                approvedDoc = this.returnApprovedDoc(doc, identity);
            }
            approvedDoc.netsuiteSyned = true; // flag to sync
            // netsuiteSync flag for when the sync has already happened

            // if Indirect make sure to not Sync
            if (approvedDoc.type === 'Indirect') {
                approvedDoc.timeSynced = new Date();
                approvedDoc.netsuiteId = '-'
                approvedDoc.syncedBy = identity.username;
            }
            this.findByIdAndUpdate(id, approvedDoc, {save: false, new: true})
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    /**
     * For when the manager approves the work order and nothing else
     * @param id
     * @param identity
     */
    workOrderSchema.statics.managerApprove = function (id, identity) {
        return new Promise((resolve, reject) => {
            if (!identity) return reject(new AuthError("Not authenticated"));
            if (identity.role !== 'admin' && identity.role !== 'manager') return reject(new AuthError("You do not have privileges to do that"));
            if (typeof id === "string") id = ObjectId(id);

            this.findByIdAndUpdate(id, {
                    $set: {
                        approvedBy:      identity.username,
                        timeApproved:    new Date(),
                        managerApproved: true,
                    },
                })
                .then(resolve)
                .catch(reject);
        });
    };

    //fetch by _id
    workOrderSchema.statics.fetch = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === "string") id = ObjectId(id);

            this.findById(id)
                .exec()
                .then(populateTechByTechId)
                .then(resolve)
                .catch(reject);
        });
    };

    //count documents
    workOrderSchema.statics._count = function (options) {
        return new Promise((resolve, reject) => {
            let query;
            let userQuery = null;

            const Q = queryConstructor(options, userQuery);
            query = Q.query;
            userQuery = Q.userQuery;

            if (userQuery) {
                User.find(userQuery, {username: 1}).exec().then(users => {
                        let ids = _.map(users, 'username');

                        if (options.supervised.length > 0) {
                            ids = _.intersection(ids, options.supervised);
                        }

                        query.techId = {$in: ids};

                        return this.find(query)
                            .count();
                    })
                    .then(resolve)
                    .catch(reject);

            } else {
                this.find(query)
                    .count()
                    .then(resolve)
                    .catch(reject);
            }
        });
    };

    //list documents
    workOrderSchema.statics.list = function (options) {
        return new Promise((resolve, reject) => {
            //query object
            let query;
            let userQuery = null;

            const Q = queryConstructor(options, userQuery);
            query = Q.query;
            userQuery = Q.userQuery;

            //query models
            if (userQuery) {
                User.find(userQuery, {username: 1})
                    .exec()
                    .then((users) => {
                        // ids actually are the users usernames!!!
                        let userNames = _.map(users, 'username');

                        if (options.supervised.length > 0) {
                            userNames = _.intersection(userNames,
                                options.supervised);
                        }

                        // log.trace({ids: userNames}, "IDs of users");

                        query.techId = {$in: userNames};

                        // log.trace({query: query}, "Query workorders");
                        return this.find(query)
                            .skip(options.skip)
                            .limit(options.limit)
                            .sort(options.sort)
                            .exec();
                    })
                    .then((r) => Promise.all(r.map(populateTechByTechId)))
                    .then(resolve)
                    .catch(reject);
            } else {
                this.find(query)
                    .skip(options.skip)
                    .limit(options.limit)
                    .sort(options.sort)
                    .exec()
                    .then((r) => Promise.all(r.map(populateTechByTechId)))
                    .then(resolve)
                    .catch(reject);
            }
        });
    };

    // get the unapproved workorders for areas
    workOrderSchema.statics.unapprovedByArea = function (users) {
        return new Promise((resolve, reject) => {
            let TheseUsers = [];
            try {
                TheseUsers = users.map((user) => JSON.parse(user));
            } catch (parseError) {
                TheseUsers = [];
                return reject(parseError)
            }
            Promise.all(TheseUsers.map((tech) => {
                    return this.privateAggregateArea(tech,
                        {area: tech.area, count: 0});
                }))
                .then(resolve)
                .catch(reject);
        });
    };

    /**
     * return a list of users and their unapproved count
     * @param users
     * @returns {Promise<any>}
     */
    workOrderSchema.statics.unapprovedByUser = function (users) {
        return new Promise((resolve, reject) => {
            let TheseUsers = [];
            try {
                TheseUsers = JSON.parse(users);
            } catch (ignore) {
                TheseUsers = [];
            }
            Promise.all(TheseUsers.map((tech) => {
                    return this.privateAggregateUserUnapproved(tech,
                        {user: tech.username, count: 0});
                }))
                .then(resolve)
                .catch(reject);
        });
    };

    /**
     * Using the tech return unapproved WOs by area
     * with a single object as a param that is then
     * returned.
     * @param tech
     * @param thisArea
     * @returns {Promise<any>}
     */
    workOrderSchema.statics.privateAggregateArea = function (tech, thisArea) {
        return new Promise((resolve, reject) => {
            this.aggregate()
                .match({
                    techId:          tech.username,
                    managerApproved: false,
                })
                .group({
                    _id:   '$techId',
                    count: {$sum: 1},
                }, {allowDiskUse: true})
                .exec()
                .then((res) => {
                    if (res.length > 0) {
                        thisArea.count = res[0].count;
                    } else {
                        thisArea.count = 0;
                    }
                    resolve(thisArea);
                })
                .catch(reject);
        });
    };
    /**
     * Using the username grab all unapproved wos count for
     * this current user.
     * @param tech
     * @param thisUser
     * @returns {Promise<any>}
     */
    workOrderSchema.statics.privateAggregateUserUnapproved = function (tech,
        thisUser) {
        return new Promise((resolve, reject) => {
            this.aggregate()
                .match({
                    techId:          tech.username,
                    managerApproved: false,
                })
                .group({
                    _id:   '$techId',
                    count: {$sum: 1},
                }, {allowDiskUse: true})
                .exec()
                .then((res) => {
                    if (res.length > 0) {
                        thisUser.count = res[0].count;
                    } else {
                        thisUser.count = 0;
                    }
                    resolve(thisUser);
                })
                .catch(reject);
        });
    };

    workOrderSchema.statics.woPayrollDump = function (options) {
        return new Promise((resolve, reject) => {
            let query;
            let userQuery = null;
            const Q = queryConstructor(options, userQuery);
            query = Q.query;
            userQuery = Q.userQuery;

            if (userQuery) {
                User.find(userQuery, {username: 1})
                    .exec()
                    .then((users) => {
                        let userNames = _.map(users, 'username');
                        if (options.supervised.length > 0) {
                            userNames = _.intersection(userNames,
                                options.supervised);
                        }
                        query.techId = {$in: userNames};
                        return payrollDump(this, query, PaidTimeOff);
                    })
                    .then(resolve)
                    .catch(reject);
            } else {
                payrollDump(this, query, PaidTimeOff)
                    .then(resolve)
                    .catch(reject);
            }
        });
    };

    workOrderSchema.statics.woDumpReport = function (options) {
        return new Promise((resolve, reject) => {
            let query;
            let userQuery = null;
            const Q = queryConstructor(options, userQuery);
            query = Q.query;
            userQuery = Q.userQuery;
            if (userQuery) {
                User.find(userQuery, {username: 1})
                    .exec()
                    .then((users) => {
                        let userNames = _.map(users, 'username');
                        if (options.supervised.length > 0) {
                            userNames = _.intersection(userNames, options.supervised)
                        }

                        query.techId = {$in: userNames};
                        return woDump(this, query);
                    })
                    .then(resolve)
                    .catch(reject);
            } else {
                woDump(this, query)
                    .then(resolve)
                    .catch(reject);
            }
        });
    };

    workOrderSchema.statics.woPartsDumpReport = function (options) {
        return new Promise((resolve, reject) => {
            let query;
            let userQuery = null;
            const Q = queryConstructor(options, userQuery);
            query = Q.query;
            userQuery = Q.userQuery;

            if (userQuery) {
                User.find(userQuery, {username: 1})
                    .exec()
                    .then((users) => {
                        let userNames = _.map(users, 'username');
                        if (options.supervised.length > 0) {
                            userNames = _.intersection(userNames,
                                options.supervised);
                        }
                        query.techId = {$in: userNames};
                        return woPartsDump(this, User, query);
                    })
                    .then(resolve)
                    .catch(reject);
            } else {
                woPartsDump(this, User, query)
                    .then(resolve)
                    .catch(reject);
            }
        });
    };

    //Delete document
    workOrderSchema.statics.delete = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === "string") id = ObjectId(id);

            this.findOneAndRemove({_id: id})
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    //Get WorkOrders for Unit
    workOrderSchema.statics.getUnitWorkOrders = function (options) {
        return new Promise((resolve, reject) => {
            if (!options.unit) return reject(new ClientError("Missing  Unit Number"));

            this.list(options)
                .then(resolve)
                .catch(reject);
        });
    };

    /*** DOCUMENT METHODS ***/

    workOrderSchema.methods.getCreateDate = function () {
        return new Date(this._id.getTimestamp());
    };

    workOrderSchema.statics.returnApprovedDoc = function (doc, identity) {
        doc.timeApproved = new Date();
        doc.approvedBy = identity.username;
        doc.managerApproved = true;
        return doc;
    };

    workOrderSchema.statics.pastDueWOEmail = function(wos) {
        let mailer = new GmailMailer();
        const TH = require('../helpers/task_helper');
        const times = TH.previousWeekEndDateAndCheckDate();
        mailer.transport.verify((error) => {
            if (error) {
                log.error({error: error}, "Issue with verify email Array on Insert: " + error);
            } else {
                Promise.all(wos.map((wo) => {
                        return this.find({
                                timeStarted:   wo.timeStarted,
                                timeSubmitted: wo.timeSubmitted,
                                techId:        wo.techId,
                            })
                            .exec();
                    }))
                    .then((workorders) => {
                        workorders = flattenArr(workorders);
                        let to;
                        if (process.env.NODE_ENV !== 'production' || process.env.NODE_ENV === undefined) {
                            to = 'mwhelan@parkenergyservices.com';
                        } else {
                            to = 'caven@parkenergyservices.com, canderson@parkenergyservices.com, jwarren@parkenergyservices.com';
                        }
                        workorders.forEach((wo) => {
                            if ((new Date(wo.timeSubmitted).getTime() <
                                times.lastDay.getTime()) &&
                                (new Date(wo.timePosted).getTime() >
                                    times.checkDay.getTime())) {
                                let mailOptions = {
                                    from:    '"Orion Alerts" <orionalerts@parkenergyservices.com>',
                                    to:      to,
                                    subject: `LATE SUBMISSION | ${wo.type} | ${wo.header.unitNumber} | ${wo.techId} | ${new Date(
                                        wo.timeSubmitted).toLocaleString()}`,
                                    // text: ,
                                    html:    `
                  <body>
                      <a href="http://orion.parkenergyservices.com/#/workorder/review/${wo._id}">Link to Work Order</a>
                      <br>
                  </body>
                  `,
                                };
                                mailer.transport.sendMail(mailOptions,
                                    (error, info) => {
                                        if (error) {
                                            return log.error(
                                                {error: error}, 'Error sending email Array on Insert: ' +
                                                error);
                                        }
                                        log.trace({message: info.messageId},
                                            'Message sent');
                                        log.trace({
                                            messageUrl: nodemailer.getTestMessageUrl(
                                                info),
                                        }, 'Preview URL');
                                    });
                            }
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        log.error({error: err}, 'Issue emailing out late wos' +
                            err);
                    });
            }
        });
    };

    /**
     * Takes in workorders submitted from the Client
     * @param wos
     * @returns {*} -> the work orders that were received are returned unchanged
     */
    workOrderSchema.statics.emailWO = function(wos) {
        let mailer = new GmailMailer();
        let to;
        if (process.env.NODE_ENV !== 'production' || process.env.NODE_ENV === undefined) {
            to = 'mwhelan@parkenergyservices.com';
        } else {
            to = 'orionalerts@parkenergyservices.com';
        }
        if (Object.prototype.toString.call(wos) === '[object Array]') {
            this.pastDueWOEmail(wos);
            wos.forEach((wo) => {
                const {engine: {replaceEngine}, compressor: {replace}} = wo.laborCodes;
                if (wo.type === "New Set" || wo.type === "Release" || wo.type === 'Swap' || wo.type === 'Transfer') {
                    mailer.transport.verify(function (error, success) {
                        if (error) {
                            log.error({error: error}, "Issue with verify email Array on Insert: " + error);
                        } else {
                            log.trace({success: success}, "Server is ready to take our messages");
                            let replace = '';
                            if (replaceEngine.hours > 0 || replaceEngine.minutes > 0 || replace.hours > 0 || replace.minutes > 0) {
                                replace = 'Replacement!';
                            }

                            let mailOptions = {
                                from:    '"Orion Alerts" <orionalerts@parkenergyservices.com>',
                                to:      to,
                                subject: `${wo.type} | ${wo.header.unitNumber} | ${wo.techId} | ${wo.header.customerName} | ${wo.header.leaseName} | ${replace}`,
                                // text: ,
                                html:    `
              <body>
                  <a href="http://orion.parkenergyservices.com/#/workorder/review/${wo._id}">Link to Work Order</a>
                  <br>
              </body>
              `,
                            };
                            mailer.transport.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    return log.error({error: error}, "Error sending email Array on Insert: " + error);
                                }
                                log.trace({message: info.messageId}, "Message sent");
                                log.trace({messageUrl: nodemailer.getTestMessageUrl(info)}, "Preview URL");
                            });
                        }
                    });
                } else if (replaceEngine.hours > 0 || replaceEngine.minutes > 0 || replace.hours > 0 || replace.minutes > 0) {
                    mailer.transport.verify(function (error, success) {
                        if (error) {
                            log.error({error: error}, "Issue with verify email Array on Insert: " + error);
                        } else {
                            log.trace({success: success}, "Server is ready to take our messages");

                            let mailOptions = {
                                from:    '"Orion Alerts" <orionalerts@parkenergyservices.com>',
                                to:      to,
                                subject: `${wo.type} | ${wo.header.unitNumber} | ${wo.techId} | ${wo.header.customerName} | ${wo.header.leaseName} | Replacement!`,
                                // text: ,
                                html:    `
              <body>
                  <a href="http://orion.parkenergyservices.com/#/workorder/review/${wo._id}">Link to Work Order</a>
                  <br>
              </body>
          `,
                            };
                            mailer.transport.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    return log.error({error: error}, "Error sending email Array on Insert: " + error);
                                }
                                log.trace({message: info.messageId}, "Message sent");
                                log.trace({messageUrl: nodemailer.getTestMessageUrl(info)}, "Preview URL");
                            });
                        }
                    });
                }
            });
        } else {
            this.pastDueWOEmail([wos]);
            const {engine: {replaceEngine}, compressor: {replace}} = wos.laborCodes;
            if (wos.type === "New Set" || wos.type === "Release" || wos.type === 'Swap' || wos.type === 'Transfer') {
                mailer.transport.verify(function (error, success) {
                    if (error) {
                        log.error({error: error}, "Issue with verify email on Insert: " + error);
                    } else {
                        log.trace({success: success}, "Server is ready to take our messages");
                        let replace = '';
                        if (replaceEngine.hours > 0 || replaceEngine.minutes > 0 || replace.hours > 0 || replace.minutes > 0) {
                            replace = 'Replacement!';
                        }
                        let mailOptions = {
                            from:    '"Orion Alerts" <orionalerts@parkenergyservices.com>',
                            to:      to,
                            subject: `${wos.type} | ${wos.header.unitNumber} | ${wos.techId} | ${wos.header.customerName} | ${wos.header.leaseName} | ${replace}`,
                            // text: ,
                            html:    `
            <body>
                <a href="http://orion.parkenergyservices.com/#/workorder/review/${wos._id}">Link to Work Order</a>
                <br>
            </body>
            `,
                        };
                        mailer.transport.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return log.error({error: error}, "Error sending email on Insert: " + error);
                            }
                            log.trace({message: info.messageId}, "Message sent");
                            log.trace({messageUrl: nodemailer.getTestMessageUrl(info)}, "Preview URL");
                        });
                    }
                });
            } else if (replaceEngine.hours > 0 || replaceEngine.minutes > 0 || replace.hours > 0 || replace.minutes > 0) {
                mailer.transport.verify(function (error, success) {
                    if (error) {
                        log.error({error: error}, "Issue with verify email on Insert: " + error);
                    } else {
                        log.trace({success: success}, "Server is ready to take our messages");
                        let mailOptions = {
                            from:    '"Orion Alerts" <orionalerts@parkenergyservices.com>',
                            to:      to,
                            subject: `${wos.type} | ${wos.header.unitNumber} | ${wos.techId} | ${wos.header.customerName} | ${wos.header.leaseName} | Replacement!`,
                            // text: ,
                            html:    `
            <body>
                <a href="http://orion.parkenergyservices.com/#/workorder/review/${wos._id}">Link to Work Order</a>
                <br>
            </body>
            `,
                        };
                        mailer.transport.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return log.error({error: error}, "Error sending email on Insert: " + error);
                            }
                            log.trace({message: info.messageId}, "Message sent");
                            log.trace({messageUrl: nodemailer.getTestMessageUrl(info)}, "Preview URL");
                        });
                    }
                });
            }
        }
        return wos;
    };

    const populateTechByTechId = (wo) => {
        return new Promise((resolve, reject) => {
            if (Object.prototype.toString.call(wo) === '[object Null]') {
                resolve(null);
            } else {
                wo = wo.toObject();
                User.findOne({username: wo.techId})
                    .lean()
                    .exec()
                    .then(tech => {
                        wo.technician = tech ? tech : null;
                        return wo;
                    })
                    .then(resolve)
                    .catch(reject);
            }
        });
    };
};


/*** PRIVATE METHODS ***/

const queryConstructor = (options, userQuery) => {
    const query = {};
    if (options.unit) {
        query.$or = [{unitNumber: options.unit}, {"header.unitNumber": options.unit}];
        // query.unitNumber = options.unit;
    }

    if (options.tech) {
        userQuery = {$text: {$search: options.tech}};
    }

    if (options.loc) {
        query['header.leaseName'] = {
            $regex: options.loc,
            $options: 'i'
        };
    }

    if (options.cust) {
        query['header.customerName'] = {
            $regex: options.cust,
            $options: 'i'
        };
    }


    /*
    * Select options for checkboxes search
    *
    * billed to customer:       BC        unapproved: U
    * billed to customerParts:  BCP       approved:   A
    * billed:                   B         synced:     S
    *
    * need to construct an and/or mapping
    * */

    // if something on both sides were selected
    if ((options.billable || options.billParts || options.billed) && (options.approved || options.unapproved || options.synced)) {
        query.$and = [];

        // billed was selected but synced was not
        // possible: (B || BCP || BC) && (A || U) && S
        if (!options.synced && options.billed) {
            // (B
            query.$and.push({$or: [{"billingInfo.billed": true}]});
            // || BCP
            if (options.billParts) {
                query.$and[0].$or.push({
                    parts: {
                        $elemMatch: {
                            isBillable: true
                        }
                    }
                });
            }
            // || BC)
            if (options.billable) {
                query.$and[0].$or.push({"billingInfo.billableToCustomer": true});
            }
            // && (A
            if (options.approved) {
                query.$and.push({$or: [{managerApproved: true}]});
            }
            // || U)
            if (options.unapproved) {
                if (query.$and[1]) {
                    query.$and[1].$or.push({managerApproved: false});
                    query.$and[1].$or.push({managerApproved: {$exists: false}});
                } else {
                    query.$and.push({$or: [{managerApproved: false}]});
                    query.$and[1].$or.push({managerApproved: {$exists: false}});
                }
            }
            // && S
            query.$and.push({netsuiteSyned: false});

            // synced selected but not billed
            // possible:  (S || A || U) && (BCP || BC) && B
        } else if (options.synced && !options.billed) {
            // (S
            query.$and.push({$or: [{netsuiteSyned: true}]});
            // || A
            if (options.approved) {
                query.$and[0].$or.push({managerApproved: true});
            }
            // || U)
            if (options.unapproved) {
                query.$and[0].$or.push({managerApproved: false});
                query.$and[0].$or.push({managerApproved: {$exists: false}});
            }
            // && (BCP
            if (options.billParts) {
                query.$and.push({
                    $or: [{
                        parts: {
                            $elemMatch: {
                                isBillable: true
                            }
                        }
                    }]
                });
            }
            // || BC)
            if (options.billable) {
                if (query.$and[1]) {
                    query.$and[1].$or.push({"billingInfo.billableToCustomer": true});
                } else {
                    query.$and.push({$or: [{"billingInfo.billableToCustomer": true}]});
                }
            }
            // && B   .. billed is newer, must check if exists Nov2016
            query.$and.push({$or: [{"billingInfo.billed": false}]});
            query.$and[2].$or.push({"billingInfo.billed": {$exists: false}});

            // billed and synced selected nothing else
            // possible: (A || U) && (BCP || BC) && (B) && S
        } else if (!options.synced && !options.billed) {
            // (A
            if (options.approved) {
                query.$and.push({$or: [{managerApproved: true}]});
            }
            // || U)
            if (options.unapproved) {
                if (query.$and[0]) {
                    query.$and[0].$or.push({managerApproved: false});
                    query.$and[0].$or.push({managerApproved: {$exists: false}});
                } else {
                    query.$and.push({$or: [{managerApproved: false}]});
                    query.$and[0].$or.push({managerApproved: {$exists: false}});
                }
            }
            // && (BCP
            if (options.billParts) {
                query.$and.push({
                    $or: [{
                        parts: {
                            $elemMatch: {
                                isBillable: true
                            }
                        }
                    }]
                });
            }
            // || BC)
            if (options.billable) {
                if (query.$and[1]) {
                    query.$and[1].$or.push({"billingInfo.billableToCustomer": true});
                } else {
                    query.$and.push({$or: [{"billingInfo.billableToCustomer": true}]});
                }
            }
            // && (B)
            query.$and.push({$or: [{"billingInfo.billed": false}]});
            query.$and[2].$or.push({"billingInfo.billed": {$exists: false}});
            // && S
            query.$and.push({netsuiteSyned: false});
        } else if (options.billed && options.synced) {
            // (A
            if (options.approved) {
                query.$and.push({$or: [{managerApproved: true}]});
            }
            // || U)
            if (options.unapproved) {
                if (query.$and[0]) {
                    query.$and[0].$or.push({managerApproved: false});
                    query.$and[0].$or.push({managerApproved: {$exists: false}});
                } else {
                    query.$and.push({$or: [{managerApproved: false}]});
                    query.$and[0].$or.push({managerApproved: {$exists: false}});
                }
            }
            // && (BCP
            if (options.billParts) {
                query.$and.push({
                    $or: [{
                        parts: {
                            $elemMatch: {
                                isBillable: true
                            }
                        }
                    }]
                });
            }
            // || BC)
            if (options.billable) {
                if (query.$and[1]) {
                    query.$and[1].$or.push({"billingInfo.billableToCustomer": true});
                } else {
                    query.$and.push({$or: [{"billingInfo.billableToCustomer": true}]});
                }
            }
            // && (B)
            query.$and.push({$or: [{"billingInfo.billed": true}]});
            // query.$and[2].$or.push({"billingInfo.billed": {$exists: true}});
            // && S
            query.$and.push({netsuiteSyned: true});
        }
        // All right side possible checked also works the same if none selected
        // possible (A || U || S)
    } else if ((options.approved || options.unapproved || options.synced) && (!options.billed && !options.billable && !options.billParts)) {
        query.$and = [];
        // (A
        if (options.approved) {
            query.$and.push({$or: [{managerApproved: true}]});
        }
        // || U
        if (options.unapproved) {
            if (query.$and[0]) {
                query.$and[0].$or.push({managerApproved: false});
                query.$and[0].$or.push({managerApproved: {$exists: false}});
            } else {
                query.$and.push({$or: [{managerApproved: false}]});
                query.$and[0].$or.push({managerApproved: {$exists: false}});
            }
        }
        // || S)
        if (options.synced) {
            if (query.$and[0]) {
                query.$and[0].$or.push({netsuiteSyned: true});
            } else {
                query.$and.push({$or: [{netsuiteSyned: true}]});
            }
        } else {
            query.$and.push({netsuiteSyned: false});
        }
        // All left possible checked works the same if none selected
        // synced is auto set to false so included
        // possible (BC || BCP || B) && S
    } else if ((options.billParts || options.billable || options.billed && (!options.approved && !options.unapproved && !options.synced))) {
        query.$and = [];
        // (BC
        if (options.billable) {
            query.$and.push({$or: [{"billingInfo.billableToCustomer": true}]});
        }
        // || BCP
        if (options.billParts) {
            if (query.$and[0]) {
                query.$and[0].$or.push({
                    parts: {
                        $elemMatch: {
                            isBillable: true
                        }
                    }
                });
            } else {
                query.$and.push({
                    $or: [{
                        parts: {
                            $elemMatch: {
                                isBillable: true
                            }
                        }
                    }]
                });
            }
        }
        // || B)
        if (!options.billed) {
            query.$and.push({$or: [{"billingInfo.billed": false}]});
            query.$and[1].$or.push({"billingInfo.billed": {$exists: false}});
        } else {
            query.$and.push({"billingInfo.billed": options.billed});
        }
        // && S
        query.$and.push({netsuiteSyned: false});
    }

    // for type and pm search
    if (options.type && options.pm !== null && options.pm !== undefined) {
        query.$and.push({
            $or: [{
                type: {
                    $regex:   options.type,
                    $options: 'i',
                },
            }, {
                pm: options.pm,
            }],
        })
    } else {
        if (options.type) {
            query.type = {
                $regex:   options.type,
                $options: 'i',
            }
        }
        if (options.pm !== null && options.pm !== undefined) {
            query.pm = options.pm
        }
    }

    //date range filter
    if (options.from) {
        query.timeStarted = {
            $gte: options.from,
            $lte: options.to || new Date()
        };
    }

    if (options.hasOwnProperty('supervised') && options.role === 'admin') {
        if (options.supervised.length > 0) {
            query.techId = {$in: options.supervised};
        }
    }

    if (options.hasOwnProperty('supervised') && options.role === 'manager') {
        // need this or managers will get all technicians
        if (options.supervised.length > 0) {
            query.techId = {$in: options.supervised};
        }
    }
    // console.log(JSON.stringify(query))
    // console.log('---')
    // console.log(JSON.stringify(options))
    // console.log('----')
    // console.log(JSON.stringify(userQuery))
    return {options, userQuery, query};
};
