'use strict';

const ObjectId    = require('mongoose').Types.ObjectId,
      Unit        = require('../models/unit'),
      User        = require('../models/user'),
      PaidTimeOff = require('../models/paidTimeOff'),
      Customer    = require('../models/customer'),
      EditHistory = require('../models/editHistory'),
      _           = require('lodash'),
      axios       = require('axios'),
      log         = require('../helpers/logger'),
      woDump      = require('../databaseScripts/woDump'),
      payrollDump = require('../databaseScripts/payrollDump'),
      woPartsDump = require('../databaseScripts/woPartsDump'),
      ClientError = require('../errors/client'),
      AuthError   = require('../errors/auth'),
      nodemailer  = require('nodemailer'),
      GmailMailer = require('../helpers/email_helper'),
      ServerError = require('../errors/server'),
      flattenArr = require('tedb-utils').flattenArr;
const {diff} = require('deep-diff');
const {isEmpty, rmArrObjDups} = require('tedb-utils');

module.exports = function (workOrderSchema) {

    workOrderSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {
            log.error('MANAGER INSERT!!!! (30)');
            let dataArr = [].concat(data); //Ensure data is an array, cast single object to array
            //clean data
            dataArr.forEach((doc) => {
                delete doc._id;
                delete doc.__v;
            });
            let newArr;

            // Consider the input an array of incoming work orders
            // Promise chain
            Promise.all([
                    //Populate user/tech
                    User.find({
                        username: {
                            // get every User with that techId
                            $in: _.map(dataArr, 'techId')
                        }
                    }),
                    //Populate unit
                    Unit.find({
                        _id: {
                            // get every Unit with that Id - should be 1
                            $in: dataArr.map((obj) => {
                                if (obj.hasOwnProperty('unit') && obj !== null && obj !== undefined) {
                                    if (obj.unit !== null && obj.unit !== undefined && obj.unit !== '') {
                                        return typeof obj.unit === 'string'
                                            ? ObjectId(obj.unit)
                                            : obj.unit;
                                    } else {
                                        return null;
                                    }
                                } else {
                                    return null;
                                }
                            }),
                        }
                    }),
                    // are any of the WOs duplicats
                    this.find({
                        timeSubmitted: {
                            $in: dataArr.reduce((acc, o) => {
                                if (o.hasOwnProperty('timeSubmitted')) {
                                    return acc.concat(o.timeSubmitted);
                                } else {
                                    return acc;
                                }
                            }, [])
                        },
                        techId: {
                            $in: dataArr.reduce((acc, o) => {
                                if (o.hasOwnProperty('techId')) {
                                    return acc.concat(o.techId);
                                } else {
                                    return acc;
                                }
                            }, [])
                        }
                    })
                ])
                //Insert docs
                .then((docs) => {
                    // docs is an array of 2. [techDocs, unitDocs];
                    const techDocs = docs[0];
                    const unitDocs = docs[1];
                    const FoundWOs = docs[2];
                    newArr = dataArr.reduce((acc, doc) => {
                        if (isEmpty(doc)) {
                            return acc;
                        }
                        let foundDup = {found: false};
                        FoundWOs.forEach((fDoc) => {
                            if (fDoc.timeSubmitted.toString() === new Date(doc.timeSubmitted).toString()) {
                                foundDup = {obj: fDoc, sync: false, found: true, managerSync: false};
                            }
                        });

                        if (foundDup.found) {
                            return acc.concat(foundDup);
                        }
                        // dataArr.forEach((doc) => {
                        // Pull the technician out of the array of found users with matching username
                        const tech = _.find(techDocs, (o) => {
                            return doc.techId === o.username;
                        });
                        // Pull the unit from the array of found Units with that netsuite ID
                        const unit = _.find(unitDocs, (o) => {
                            if (doc.hasOwnProperty('unit') && doc.unit !== null) {
                                return `${o._id}` === `${doc.unit}`;
                            }
                        });

                        if (tech) {
                            doc.technician = tech._id;
                        } else {
                            doc.technician = null;
                        }

                        // if there is a unit populate the found unit with the full sate
                        // and the full county just in case.
                        if (unit) {
                            // only once both state and county are found will it try and
                            // do the sync procedures
                            // set the doc.unit to the unit id
                            delete unit._id;
                            doc.unitSnapShot = unit;
                            let billable = false;
                            // if doc is billable do not sync to netsuite
                            if (doc.billingInfo.billableToCustomer) {
                                billable = true;
                            }
                            if (doc.parts.length > 0) {
                                for (const part of doc.parts) {
                                    if (part.isBillable) {
                                        billable = true;
                                    }
                                }
                            }

                            /**
                             * Check if all special fields of a Unit match all
                             * the corresponding fields on the work order
                             */
                            if ((doc.type !== "Indirect" && doc.type !== 'Swap' && doc.type !== 'Transfer') && !billable ) {
                                if (compareWorkorderUnitToUnit(getWorkOrderUnitInfo(doc), unit) && LaborCodePasses(doc)) {
                                    /**
                                     * the doc matches 100% with the current
                                     * unit state
                                     * */
                                    return acc.concat({obj: doc, sync: true, found: false, managerSync: false});
                                } else {

                                    /**
                                     * Manager approve if everything matches
                                     * except the serial numbers
                                     */
                                    if (compareWorkorderUnitToUnitSerial(getWorkOrderUnitSerial(doc), unit) && LaborCodePasses(doc)) {
                                        return acc.concat({obj: doc, sync: false, found: false, managerSync: true});
                                    } else {
                                        // else don't sync
                                        return acc.concat({obj: doc, sync: false, found: false, managerSync: false});
                                    }
                                }
                            } else {
                                return acc.concat({obj: doc, sync: false, found: false, managerSync: false});
                            }
                        } else {
                            doc.unitSnapShot = null;
                            return acc.concat({obj: doc, sync: false, found: false, managerSync: false});
                            // promises.push(new Promise((res) => res(doc)));
                        }
                    }, []);
                    return newArr;
                    // return Promise.all(promises);
                })
                .then((objects) => {
                    let insertObjects = [];
                    if (!isEmpty(objects)) {
                        insertObjects = objects.reduce((acc, cur) => {
                            if (cur.found === false) {
                                log.error(
                                    `MANAGER (190) Type of WO ${cur.obj.type}`);
                                if (isEmpty(cur.obj)) {
                                    return acc;
                                } else {
                                    return acc.concat(cur.obj);
                                }
                            } else {
                                return acc;
                            }
                        }, []);
                        insertObjects = rmArrObjDups(insertObjects,
                            'timeSubmitted');
                        if (isEmpty(insertObjects)) {
                            return [];
                        } else {
                            log.error(`MANAGER (205) objects:->${
                                insertObjects.length}`);
                            return this.insertMany(insertObjects);
                        }
                    } else {
                        return [];
                    }
                })
                .then((docs) => this.emailWO(docs))
                .then((docs) => {
                    const promises = [];
                    newArr.forEach((item) => {
                        // for duplicate items
                        if (item.found) {
                            // return the found object because it has already been
                            // synced.
                            promises.push(new Promise((res) => res(item.obj)));
                        } else {
                            // for items that were new
                            docs.forEach((document) => {
                                if ((document.timeSubmitted.toString() ===
                                    new Date(item.obj.timeSubmitted).toString()) &&
                                    (item.found === false)) {
                                    if (item.sync) {
                                        const SyncDoc = item.obj;
                                        SyncDoc._id = document._id
                                            ? document._id
                                            : '';
                                        SyncDoc.id = document.id ? document.id : '';
                                        // prevent from submitting items.length *
                                        // docs.length
                                        item.found = true;
                                        // for testing
                                        if (process.env.NODE_ENV === undefined) {
                                            promises.push(new Promise(
                                                (res) => res(document)));
                                        } else {
                                            promises.push(
                                                this.AutoSyncToNetsuite(SyncDoc));
                                        }
                                    } else if (item.managerSync) {
                                        // make manager approved.
                                        const updateDoc = item.obj;
                                        updateDoc.timeApproved = new Date();
                                        updateDoc.managerApproved = true;
                                        updateDoc.approvedBy = updateDoc.techId;
                                        promises.push(this.find({
                                                techId:        updateDoc.techId,
                                                timeSubmitted: updateDoc.timeSubmitted,
                                                timeCreated:   updateDoc.timeCreated,
                                            })
                                            .exec()
                                            .then((docs) => {
                                                if (docs.length > 0) {
                                                    const doc = docs[0];
                                                    return this.findByIdAndUpdate(
                                                        doc._id, updateDoc,
                                                        {safe: false, new: true})
                                                        .exec();
                                                } else {
                                                    return new Promise(
                                                        (res) => res(document));
                                                }
                                            }),
                                        );
                                    } else {
                                        item.found = true;
                                        promises.push(
                                            new Promise((res) => res(document)));
                                    }
                                }
                            });
                        }
                    });
                    return Promise.all(promises);
                })
                .then(resolve)
                .catch((err) => {
                    log.error(`Error Occured during Orion Insert`);
                    reject(err);
                });
        });
    };

    //update single document
    workOrderSchema.statics.updateDoc = function (id, data, identity) {
        log.info({id}, "Update Doc");
        return new Promise((resolve, reject) => {
            if (!identity) return reject(new AuthError("Not authenticated"));
            if (typeof id === "string") id = ObjectId(id);

            if (data.netsuiteSyned && !data.timeSynced && !data.syncedBy) {
                log.trace({netsuiteSyned: data.netsuiteSyned, id}, "Is Submitting to netsuite?");

                log.error(
                    `MANAGER (274) netsuiteSyned && !synced -> fn:updateDoc`);

                this.findById(id)
                    .exec()
                    .then((doc) => {
                        if (doc.timeSynced && doc.syncedBy &&
                            doc.netsuiteSyned) throw new ClientError(
                            'Workorder Already Synced');
                        if (doc.type === 'Indirect') throw new ClientError(
                            'Indirects Cannot Be Synced');
                        log.trace('Found document to sync');
                        return syncToNetsuite(doc);
                    })
                    .then((doc) => {
                        log.trace('Update doc');
                        doc.updated_at = new Date();
                        doc.timeSynced = new Date();
                        doc.syncedBy = identity.username;

                        return this.findByIdAndUpdate(doc._id, doc,
                            {safe: false, new: true})
                            .lean()
                            .exec();
                    })
                    .then(resolve)
                    .catch(reject);
            } else {
                log.error(`MANAGER (297) !netsuiteSyned || synced -> fn:updateDoc`);
                this.diff(id, data, identity).then((data) => {
                        return this.findByIdAndUpdate(id, data,
                            {safe: false, new: true})
                            .lean()
                            .exec();
                    })
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
                approvedDoc.syncedBy = identity.username;
            }
            log.error(`MANAGER (419) fn:UpdateToSync: doc: ${JSON.stringify(
                approvedDoc)}`);
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
                        log.trace({users: users}, "Query technicians by name");
                        // ids actually are the users usernames!!!
                        let userNames = _.map(users, 'username');

                        if (options.supervised.length > 0) {
                            userNames = _.intersection(userNames,
                                options.supervised);
                        }

                        log.trace({ids: userNames}, "IDs of users");

                        query.techId = {$in: userNames};

                        log.trace({query: query}, "Query workorders");
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

            /*Promise.all(JSON.parse(users).map((tech) => {
              const thisArea = {area: tech.area, count: 0};
              return this.privateAggregateArea(tech, thisArea);
            }))*/
            let TheseUsers = [];
            try {
                TheseUsers = JSON.parse(users);
            } catch (ignore) {
                TheseUsers = [];
            }
            Promise.all(TheseUsers.map((tech) => {
                    return this.privateAggregateArea(tech,
                        {area: tech.area, count: 0});
                }))
                .then((all) => {
                    resolve(all);
                })
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
                        if (options.report) {
                            return payrollDump(this, query, PaidTimeOff);
                        }
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
                            userNames = _.intersection(userNames,
                                options.supervised);
                        }
                        query.techId = {$in: userNames};
                        if (options.report) {
                            return woDump(this, query);
                        }
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
                        if (options.report) {
                            return woPartsDump(this, User, query);
                        }
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

    workOrderSchema.statics.AutoSyncToNetsuite = function (data) {
        return new Promise((resolve, reject) => {
            this.findById(data.id).exec().then((doc) => {
                    console.log('sync');
                    return syncToNetsuite(doc);
                })
                .then((doc) => {
                    console.log('update after sync');
                    const now = new Date();
                    doc.updated_at = now;
                    doc.timeSynced = now;
                    doc.timeApproved = now;
                    doc.managerApproved = true;
                    doc.approvedBy = doc.techId;
                    doc.syncedBy = doc.techId;
                    return this.findByIdAndUpdate(doc._id, doc,
                        {safe: false, new: true}).lean().exec();
                })
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
                        if (process.env.NODE_ENV !== 'production') {
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

    workOrderSchema.statics.emailWO = function(wos) {
        let mailer = new GmailMailer();
        let to;
        if (process.env.NODE_ENV !== 'production') {
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

/**
 * Used to get the wo unit information of just the serial numbers and
 * coordinates
 * @param wo
 * @returns {{engineSerial: (unitReadings.engineSerial|{type}|string),
 *   compressorSerial:
 *     (unitReadings.compressorSerial|{type}|string), number: *, state: *,
 *   county: (string|county|{type, ref,
 *   autopopulate}|header.county|{type}|unitSnapShot.county|*), customerName:
 *   string, locationName:
 *     (string|null|header.leaseName|{type, index}|*)}}
 */
const getWorkOrderUnitSerial = (wo) => ({
    engineSerial: wo.unitReadings.engineSerial,
    compressorSerial: wo.unitReadings.compressorSerial,
    number: wo.unitNumber,
    state: wo.header.state,
    county: wo.header.county,
    customerName: wo.header.customerName,
    locationName: wo.header.leaseName
});
/**
 * From an incoming Work order return unit info of work order as
 * one object.
 * (wo) => obj
 */
const getWorkOrderUnitInfo = (wo) => ({
    engineSerial: wo.unitReadings.engineSerial,
    compressorSerial: wo.unitReadings.compressorSerial,
    number: wo.unitNumber,
    state: wo.header.state,
    county: wo.header.county,
    geo: wo.geo,
    customerName: wo.header.customerName,
    locationName: wo.header.leaseName
});

/**
 * Return boolean true to sync work order.
 * checks labor codes for certain cases to pass the document
 * @param wo
 * @constructor
 */
const LaborCodePasses = (wo) => {
    const {laborCodes, header: {startMileage, endMileage}} = wo;

    const laborCs = Object.keys(laborCodes);
    let totalMinutes = 0;
    let TravelHours = 0;
    laborCs.forEach((item) => {
        const lcChild = Object.keys(laborCodes[item]);
        lcChild.forEach((child) => {
            if (laborCodes[item][child].text !== 'Negative Time Adjustment' && laborCodes[item][child].text !== 'Positive Time Adjustment' && laborCodes[item][child].text !== 'Lunch') {
                totalMinutes += +laborCodes[item][child].hours * 60;
                totalMinutes += +laborCodes[item][child].minutes;
            }
            if (laborCodes[item][child].text === 'Service Travel') {
                TravelHours += +laborCodes[item][child].hours * 60;
                TravelHours += +laborCodes[item][child].minutes / 60;
            }
        });
    });
    const totalHours = Math.floor(totalMinutes / 60);
    const distance = +endMileage - +startMileage;
    // don't let work orders over 8 hours auto sync
    if (totalHours > 10) {
        return false;
    }
    // block if distance but no service travel
    /*if (TravelHours === 0 && distance > 0) {
        return false;
    }
    return true;*/
    return !(TravelHours === 0 && distance > 0);
};

/*const percentDiff = (v1, v2) => {
    return Math.abs(Math.abs(v1 - v2)/((v1+v2)/2) * 100);
};*/

/**
 * Returns True if everything is right except Serial #s
 * @param wo
 * @param unit
 * @returns {boolean}
 */
const compareWorkorderUnitToUnitSerial = (wo, unit) => {
    let state;
    let county;
    if (unit.state !== null) {
        state = unit.state.name;
    } else {
        state = '';
    }
    if (unit.county !== null) {
        county = unit.county.name;
    } else {
        county = '';
    }
    return ((wo.number.toUpperCase() === unit.number.toUpperCase()) &&
        (wo.state.toUpperCase() === state.toUpperCase()) &&
        (wo.county.toUpperCase() === county.toUpperCase()) &&
        (wo.locationName.toUpperCase() === unit.locationName.toUpperCase()) &&
        (wo.customerName.toUpperCase() === unit.customerName.toUpperCase()) &&
        ((wo.engineSerial !== unit.engineSerial) ||
            (wo.compressorSerial !== unit.compressorSerial)));
};

/**
 * Compare the incoming work order unit information to an actual
 * unit.
 * (wo, unit) => boolean
 */
const compareWorkorderUnitToUnit = (wo, unit) => {
    let state;
    let county;
    if (unit.state !== null) {
        state = unit.state.name;
    } else {
        state = '';
    }
    if (unit.county !== null) {
        county = unit.county.name;
    } else {
        county = '';
    }
    // don't block for lat long anymore
    /*(wo.geo.coordinates[0] === unit.geo.coordinates[0]) &&
      (wo.geo.coordinates[1] === unit.geo.coordinates[1])*/
    return ((wo.number.toUpperCase() === unit.number.toUpperCase()) &&
        (wo.state.toUpperCase() === state.toUpperCase()) &&
        (wo.county.toUpperCase() === county.toUpperCase()) &&
        (wo.locationName.toUpperCase() === unit.locationName.toUpperCase()) &&
        (wo.customerName.toUpperCase() === unit.customerName.toUpperCase()) &&
        (wo.engineSerial === unit.engineSerial) &&
        (wo.compressorSerial === unit.compressorSerial));
};

const populateCustomerByName = wo => {

    log.trace("populate customer by name");

    return new Promise((resolve, reject) => {
        /*if(!wo.header.customerName) return reject(new ClientError("Missing customerName on Workorder to populate"));*/

        Customer.findOne({name: wo.header.customerName})
            .lean()
            .exec()
            .then((cust) => {
                log.trace({customer: cust}, "Customer Found");
                wo.customer = cust || null;
                if (wo.customer === null) {
                    wo.customer = {netsuiteId: ''};
                }

                return wo;
            })
            .then(resolve)
            .catch(reject);
    });
};

const syncToNetsuite = (doc) => {
    log.trace("Sync to netsuite1");
    return new Promise((resolve, reject) => {
        if (!doc.header.unitNumberNSID && doc.type !== 'Swap') {
            doc.header.unitNumberNSID = doc.unit.netsuiteId;
        }
        if (!doc.unitChangeInfo.swapUnitNSID && doc.type === 'Swap') {
            doc.unitChangeInfo.swapUnitNSID = doc.unit.netsuiteId;
        }

        if (!doc.header.unitNumberNSID && !doc.unitChangeInfo.swapUnitNSID) {
            return reject(new ClientError("Indirect WorkOrders will not be synced"));
        }


        populateCustomerByName(doc).then((wo) => {
                const nswo = netSuiteFormat(wo);
                log.error({nswo: nswo}, 'Send Netsuite POST Request');
                return axios.post(
                    'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=112&deploy=1',
                    nswo, {
                        headers: {
                            'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
                            'User-Agent':    'SuiteScript-Call',
                        },
                    });
                /*return request.post({
                    url: 'https://rest.na1.netsuite.com/app/site/hosting/restlet.nl?script=112&deploy=1',
                    headers: {
                        'Authorization': 'NLAuth nlauth_account=4086435,nlauth_email=WebServices@parkenergyservices.com,nlauth_signature=~Orion2018~',
                        'User-Agent': 'SuiteScript-Call'
                    },
                    json: nswo
                });*/
            })
            .then((resp) => {
                // log.debug({resp: resp}, 'resp not resp.data')
                resp = resp.data;
                log.error({response: resp},
                    `Netsuite Response: ${JSON.stringify(resp)}`);

                if (!resp.nswoid) {
                    throw(new ClientError('POSTing Workorder to Netsuite failed!'));
                }

                doc.netsuiteId = resp.nswoid;
                doc.netsuiteSyned = true;

                resolve(doc);
            })
            .catch(reject);
    });
};

const netSuiteFormat = wo => {
    log.trace("Formate Workorder for netsuite");
    try {
        return {

            //FA : "",
            //WOR_ORDR : "" ,

            //main
            dummy: 'dummy',
            isPM: wo.pm ? 'T' : 'F',
            techId: wo.techId,
            truckId: wo.truckId,
            truckNSID: wo.truckNSID,

            swap: wo.type === 'Swap' ? 'T' : 'F',
            transfer: wo.type === 'Transfer' ? 'T' : 'F',
            troubleCall: wo.type === "Trouble Call" ? 'T' : 'F',
            newSet: wo.type === "New Set" ? 'T' : 'F',
            release: wo.type === "Release" ? 'T' : 'F',
            correctiveMaintenance: wo.type === "Corrective" ? 'T' : 'F',
            atShop: wo.atShop ? 'T' : 'F',

            timeSubmitted: typeof wo.timeSubmitted === 'object' ? wo.timeSubmitted.toISOString() : wo.timeSubmitted,
            woStarted: typeof wo.timeStarted === 'object' ? wo.timeStarted.toISOString() : wo.timeStarted,
            woEnded: typeof  wo.timeSubmitted === 'object' ? wo.timeSubmitted.toISOString() : wo.timeSubmitted,

            //header
            unitNumber: wo.type === 'Swap' ? wo.unitChangeInfo.swapUnitNSID : wo.header.unitNumberNSID,
            customerName: wo.customer.netsuiteId,
            contactName: "",
            county: wo.header.county,
            state: wo.header.state,
            leaseName: wo.header.leaseName,
            rideAlong: wo.header.rideAlong,
            startMileage: wo.header.startMileage,
            endMileage: wo.header.endMileage,
            applicationType: wo.header.applicationtype,
            // unitChangeInfo push transfer/swap/release info
            releaseDestination: wo.unitChangeInfo.releaseDestination ? wo.unitChangeInfo.releaseDestination : '', // for release only is a WH
            transferLease: wo.unitChangeInfo.transferLease ? wo.unitChangeInfo.transferLease : '', //
            transferCounty: wo.unitChangeInfo.transferCounty ? wo.unitChangeInfo.transferCounty : '',
            transferState: wo.unitChangeInfo.transferState ? wo.unitChangeInfo.transferState : '',
            swapDestination: wo.unitChangeInfo.swapDestination ? wo.unitChangeInfo.swapDestination : '', // a WH
            swapUnitNSID: wo.unitChangeInfo.swapUnitNSID ? wo.unitChangeInfo.swapUnitNSID : '',

            assetType: wo.assetType,

            isUnitRunningOnDeparture: wo.misc.isUnitRunningOnDeparture ? 'T' : 'F',

            //unit ownership
            isCustomerUnit: wo.unitOwnership.isCustomerUnit ? 'T' : 'F',
            isRental: wo.unitOwnership.isRental ? 'T' : 'F',

            //billing info
            billableToCustomer: wo.billingInfo.billableToCustomer ? 'T' : 'F',
            warrantyWork: wo.billingInfo.warrantyWork ? 'T' : 'F',
            AFE: wo.billingInfo.AFE ? 'T' : 'F',

            //pm check list
            lowDischargeKill: wo.pmChecklist.killSettings.lowDischargeKill,
            highSuctionKill: wo.pmChecklist.killSettings.highSuctionKill,
            highDischargeKill: wo.pmChecklist.killSettings.highDischargeKill,
            lowSuctionKill: wo.pmChecklist.killSettings.lowSuctionKill,
            highDischargeTempKill: wo.pmChecklist.killSettings.highDischargeTempKill,

            //engine checks
            battery: wo.pmChecklist.engineChecks.battery ? 'T' : 'F',
            capAndRotor: wo.pmChecklist.engineChecks.capAndRotor ? 'T' : 'F',
            airFilter: wo.pmChecklist.engineChecks.airFilter ? 'T' : 'F',
            oilAndFilters: wo.pmChecklist.engineChecks.oilAndFilters ? 'T' : 'F',
            magPickup: wo.pmChecklist.engineChecks.magPickup ? 'T' : 'F',
            belts: wo.pmChecklist.engineChecks.belts ? 'T' : 'F',
            guardsAndBrackets: wo.pmChecklist.engineChecks.guardsAndBrackets ? 'T' : 'F',
            sparkPlugs: wo.pmChecklist.engineChecks.sparkPlugs ? 'T' : 'F',
            plugWires: wo.pmChecklist.engineChecks.plugWires ? 'T' : 'F',
            driveLine: wo.pmChecklist.engineChecks.driveLine ? 'T' : 'F',

            //general checks
            kills: wo.pmChecklist.generalChecks.kills ? 'T' : 'F',
            airHoses: wo.pmChecklist.generalChecks.airHoses ? 'T' : 'F',
            coolerForCracks: wo.pmChecklist.generalChecks.coolerForCracks ? 'T' : 'F',
            coolerLouverMovement: wo.pmChecklist.generalChecks.coolerLouverMovement ? 'T' : 'F',
            coolerLouverCleaned: wo.pmChecklist.generalChecks.coolerLouverCleaned ? 'T' : 'F',
            pressureReliefValve: wo.pmChecklist.generalChecks.pressureReliefValve ? 'T' : 'F',
            scrubberDump: wo.pmChecklist.generalChecks.scrubberDump ? 'T' : 'F',
            plugInSkid: wo.pmChecklist.generalChecks.plugInSkid ? 'T' : 'F',
            filledDayTank: wo.pmChecklist.generalChecks.filledDayTank ? 'T' : 'F',
            fanForCracking: wo.pmChecklist.generalChecks.fanForCracking ? 'T' : 'F',
            panelWires: wo.pmChecklist.generalChecks.panelWires ? 'T' : 'F',
            oilPumpBelt: wo.pmChecklist.generalChecks.oilPumpBelt ? 'T' : 'F',

            fuelPressureFirstCut: wo.pmChecklist.fuelPressureFirstCut,
            fuelPressureSecondCut: wo.pmChecklist.fuelPressureSecondCut,
            visibleLeaksNotes: wo.pmChecklist.visibleLeaksNotes,

            //engine compression
            cylinder1: wo.pmChecklist.engineCompression.cylinder1,
            cylinder2: wo.pmChecklist.engineCompression.cylinder2,
            cylinder3: wo.pmChecklist.engineCompression.cylinder3,
            cylinder4: wo.pmChecklist.engineCompression.cylinder4,
            cylinder5: wo.pmChecklist.engineCompression.cylinder5,
            cylinder6: wo.pmChecklist.engineCompression.cylinder6,
            cylinder7: wo.pmChecklist.engineCompression.cylinder7,
            cylinder8: wo.pmChecklist.engineCompression.cylinder8,

            //unit readings
            suctionPressure: wo.unitReadings.suctionPressure,
            dischargePressure: wo.unitReadings.dischargePressure,
            flowMCF: wo.unitReadings.flowMCF,
            rpm: wo.unitReadings.rpm,
            dischargeTemp1: wo.unitReadings.dischargeTemp1,
            dischargeTemp2: wo.unitReadings.dischargeTemp2,
            hourReading: wo.unitReadings.hourReading,
            compressorSerial: wo.unitReadings.compressorSerial,
            engineSerial: wo.unitReadings.engineSerial,
            engineOilPressure: wo.unitReadings.engineOilPressure,
            alternatorOutput: wo.unitReadings.alternatorOutput,
            compressorOilPressure: wo.unitReadings.compressorOilPressure,
            engineJWTemp: wo.unitReadings.engineJWTemp,
            engineManifoldVac: wo.unitReadings.engineManifoldVac,

            // new Serial #s
            newCompressorSerial: wo.newCompressorSerial,
            newEngineSerial: wo.newEngineSerial,

            //emission readings
            afrmvTarget: wo.emissionsReadings.afrmvTarget !== null ? wo.emissionsReadings.afrmvTarget : '0',
            catalystTempPre: wo.emissionsReadings.catalystTempPre !== null ? wo.emissionsReadings.catalystTempPre : '0',
            catalystTempPost: wo.emissionsReadings.catalystTempPost !== null ? wo.emissionsReadings.catalystTempPost : '0',
            permitNumber: wo.emissionsReadings.permitNumber !== null ? wo.emissionsReadings.permitNumber : '0',

            //comments
            repairsDescription: wo.comments.repairsDescription,
            repairsReason: wo.comments.repairsReason,
            calloutReason: wo.comments.calloutReason,
            swapReason: wo.comments.swapReason,
            transferReason: wo.comments.transferReason,
            newsetNotes: wo.comments.newsetNotes,
            releaseNotes: wo.comments.releaseNotes,
            indirectNotes: wo.comments.indirectNotes,
            timeAdjustmentNotes: wo.comments.timeAdjustmentNotes,

            //misc
            leaseNotes: wo.misc.leaseNotes,
            unitNotes: wo.misc.unitNotes,
            latitude: wo.geo.coordinates[1],
            longitude: wo.geo.coordinates[0],

            //labor codes
            //basic
            safety: formatLaborCodeTime(wo.laborCodes.basic.safety),
            positiveAdj: formatLaborCodeTime(wo.laborCodes.basic.positiveAdj),
            negativeAdj: formatLaborCodeTime(wo.laborCodes.basic.negativeAdj),
            lunch: formatLaborCodeTime(wo.laborCodes.basic.lunch),
            custRelations: formatLaborCodeTime(wo.laborCodes.basic.custRelations),
            telemetry: formatLaborCodeTime(wo.laborCodes.basic.telemetry),
            environmental: formatLaborCodeTime(wo.laborCodes.basic.environmental),
            diagnostic: formatLaborCodeTime(wo.laborCodes.basic.diagnostic),
            serviceTravel: formatLaborCodeTime(wo.laborCodes.basic.serviceTravel),
            optimizeUnit: formatLaborCodeTime(wo.laborCodes.basic.optimizeUnit),
            pm: formatLaborCodeTime(wo.laborCodes.basic.pm),
            washUnit: formatLaborCodeTime(wo.laborCodes.basic.washUnit),
            inventory: formatLaborCodeTime(wo.laborCodes.basic.inventory),
            training: formatLaborCodeTime(wo.laborCodes.basic.training),

            //engine labor codes
            oilAndFilter: formatLaborCodeTime(wo.laborCodes.engine.oilAndFilter),
            addOil: formatLaborCodeTime(wo.laborCodes.engine.addOil),
            compression: formatLaborCodeTime(wo.laborCodes.engine.compression),
            replaceEngine: formatLaborCodeTime(wo.laborCodes.engine.replaceEngine),
            replaceCylHead: formatLaborCodeTime(wo.laborCodes.engine.replaceCylHead),
            coolingSystem: formatLaborCodeTime(wo.laborCodes.engine.coolingSystem),
            fuelSystem: formatLaborCodeTime(wo.laborCodes.engine.fuelSystem),
            ignition: formatLaborCodeTime(wo.laborCodes.engine.ignition),
            starter: formatLaborCodeTime(wo.laborCodes.engine.starter),
            lubrication: formatLaborCodeTime(wo.laborCodes.engine.lubrication),
            exhaust: formatLaborCodeTime(wo.laborCodes.engine.exhaust),
            alternator: formatLaborCodeTime(wo.laborCodes.engine.alternator),
            driveOrCoupling: formatLaborCodeTime(wo.laborCodes.engine.driveOrCoupling),
            sealsAndGaskets: formatLaborCodeTime(wo.laborCodes.engine.sealsAndGaskets),

            //emissions labor codes
            install: formatLaborCodeTime(wo.laborCodes.emissions.install),
            test: formatLaborCodeTime(wo.laborCodes.emissions.test),
            repair: formatLaborCodeTime(wo.laborCodes.emissions.repair),

            //panel labor codes
            panel: formatLaborCodeTime(wo.laborCodes.panel.panel),
            electrical: formatLaborCodeTime(wo.laborCodes.panel.electrical),

            //compressor labor codes
            inspect: formatLaborCodeTime(wo.laborCodes.compressor.inspect),
            replace: formatLaborCodeTime(wo.laborCodes.compressor.replace),

            //cooler labor codes
            cooling: formatLaborCodeTime(wo.laborCodes.cooler.cooling),

            //vessel labor codes
            dumpControl: formatLaborCodeTime(wo.laborCodes.vessel.dumpControl),
            reliefValve: formatLaborCodeTime(wo.laborCodes.vessel.reliefValve),
            suctionValve: formatLaborCodeTime(wo.laborCodes.vessel.suctionValve),

            //parts
            parts: wo.parts
        };
    }
    catch (e) {
        log.debug({error: e.message, stack: e.stack}, "Error occured while formating workorder for netsuite");
    }
};

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

    if (options.type) {
        query.type = options.type;
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


    //date range filter
    if (options.from && options.to) {
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
    return {options, userQuery, query};
};

const formatLaborCodeTime = lc => {
    const hours = ((lc.minutes / 60) + lc.hours).toFixed(2);
    return hours.toString();
};
