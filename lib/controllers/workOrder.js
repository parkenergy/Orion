'use strict';

const WorkOrder = require('../models/workOrder'),
    User = require('../models/user'),
    ReviewNote = require('../models/reviewNote'),
    log = require('../helpers/logger'),
    ClientError = require('../errors/client'),
    ObjectId = require('mongoose').Types.ObjectId,
    AuthError = require('../errors/auth');

const WorkOrderCtrl = {};

/*
  Create WorkOrder
    - Desc: takes single document or array of documents to insert
*/

WorkOrderCtrl.create = (req, res) => {
    if (!req.body) return res.reject(new ClientError('Missing body'));

    WorkOrder.createDoc(req.body)
        .then(res.resolve)
        .catch(res.reject);
};

/*
* Count WorkOrder
*   - Desc: Get the count of WorkOrders in a query
*
*/

WorkOrderCtrl.authCount = (req, res) => {
    const {query: params, identity} = req;

    if (!identity) return res.reject(new AuthError('Not Authenticated'));

    const options = Options(params, identity.role);

    try {
        if (params.from) {
            options.from = new Date(params.from);
        }
        if (params.to) {
            options.to = new Date(params.to);
        }

        if (identity.role === 'manager') {
            User.getTechsForSupervisor(identity.username).then(techs => {
                if (!techs) techs = [identity.username];

                log.trace({techs: techs}, 'Techs for Supervisor');
                options.supervised = techs;
                return WorkOrder._count(options);
            }).then(res.resolve).catch(res.reject);
        } else if (identity.role === 'admin') {
            if (options.searchSupervisor) {
                User.getTechsForSupervisor(options.searchSupervisor).
                    then(techs => {
                        if (!techs) techs = [options.searchSupervisor];

                        log.trace({techs: techs},
                            'Admin Search Techs for Supervisor');
                        options.supervised = techs;
                        return WorkOrder._count(options);
                    }).
                    then(result => {
                        res.resolve(result);
                    }).
                    catch(res.reject);
            } else {
                WorkOrder._count(options).then(result => {
                    res.resolve(result);
                }).catch(res.reject);
            }
        } else return res.reject(new AuthError(
            'You do not have the privileges to access this resource'));
    } catch (e) {
        log.warn('Failed to parse params into date');
        res.reject(e);
    }
};

WorkOrderCtrl.noAuthCount = (req, res) => {
    const {query: params} = req;
    const options = {
        sort:       params.sort || '-timeSubmitted',
        unit:       params.unit || null,
        type:       params.type || null,
        pm:         (params.pm !== null && params.pm !== undefined) ? params.pm : null,
        billed:     params.billed || null,
        billable:   params.billable || null,
        billParts:  params.billParts || null,
        tech:       params.tech || null,
        loc:        params.loc || null,
        cust:       params.cust || null,
        unapproved: params.unapproved || false,
        approved:   params.approved || false,
        synced:     params.synced || false,
        limit:      +params.limit || 10,
        skip:       +params.skip || 0
    };
    if (params.from) {
        options.from = new Date(params.from);
    }
    if (params.to) {
        options.to = new Date(params.to);
    }

    WorkOrder._count(options).then(res.resolve).catch(res.reject);

};

/*
  List WorkOrder
   - Desc: List documents per parameters provided
*/
WorkOrderCtrl.list = (req, res) => {
    const {query: params, identity} = req;
    // The user needs to see all work order info no matter
    // their position.
    let preRole = '';
    if (params.noSplitInfo && identity.role === 'manager') {
        preRole = 'manager';
        identity.role = 'admin';
    }

    // log.trace({identity: identity}, 'Indentified as');

    if (!identity) return res.reject(new AuthError('Not authenticated'));

    const options = Options(params, identity.role);

    try {
        if (params.from) {
            options.from = new Date(params.from);
        }
        if (params.to) {
            options.to = new Date(params.to);
        }

        if (identity.role === 'manager') {
            User.getTechsForSupervisor(identity.username).then(techs => {
                if (!techs) techs = [identity.username];

                // log.trace({techs: techs}, 'Techs for Supervisor');
                options.supervised = techs;
                return WorkOrder.list(options);
            }).then(res.resolve).catch(res.reject);
        } else if (identity.role === 'admin') {
            if (options.searchSupervisor) {
                User.getTechsForSupervisor(options.searchSupervisor).
                    then((techs) => {
                        if (!techs) techs = [options.searchSupervisor];
                    // log.trace({techs: techs},'Admin Search for Techs for Supervisor');
                        options.supervised = techs;

                        return WorkOrder.list(options);
                    }).
                    then((result) => {
                        if (params.noSplitInfo && preRole === 'manager') {
                            identity.role = 'manager';
                        }
                        res.resolve(result);
                    }).
                    catch((e) => {
                        if (params.noSplitInfo && preRole === 'manager') {
                            identity.role = 'manager';
                        }
                        res.reject(e);
                    });
            } else {
                WorkOrder.list(options)
                    // If report flag is set then send file as a downloadable CSV
                    .then(result => {
                        if (params.noSplitInfo && preRole === 'manager') {
                            identity.role = 'manager';
                        }
                        res.resolve(result);
                    })
                    .catch((e) => {
                    if (params.noSplitInfo && preRole === 'manager') {
                        identity.role = 'manager';
                    }
                    res.reject(e);
                });
            }
        }
        else return res.reject(new AuthError(
                'You do not have the privileges to access this resource'));
    }
    catch (e) {
        log.warn('Failed to parse params into date');
        res.reject(e);
    }
};

/*
  Read WorkOrder
   - Desc: Retrieve document by _id
*/
WorkOrderCtrl.read = (req, res) => {
    const {params: {id}, identity} = req;

    if (!identity) return res.reject(
        new AuthError('You are not authenticated'));
    if (identity.role !== 'admin' && identity.role !==
        'manager') return res.reject(new AuthError('Not Authorized'));
    if (!id) return res.reject(new ClientError('Missing id parameter'));

    WorkOrder.fetch(id).then(res.resolve).catch(res.reject);
};

/*
  Update WorkOrder
   - Desc: Update single document or array
*/
WorkOrderCtrl.update = (req, res) => {
    const {body, params: {id}, identity} = req;

    if (!identity) return res.reject(
        new AuthError('You are not authenticated'));
    if (identity.role !== 'admin' && identity.role !==
        'manager') return res.reject(new AuthError('Not Authorized'));
    if (!body) return res.reject(new ClientError('Missing body'));
    if (!id) return res.reject(new ClientError('Missing id parameter'));
    if (identity.role !== 'admin' && identity.role !==
        'manager') return res.reject(new AuthError(
        'You do not have the privileges to update this resource'));

    let wo;
    wo = (typeof id === 'string') ? ObjectId(id) : id;
    // log.error('CTRL UPDATE!!!!! (229)');
    /**
     * Get all Review Notes for this WO. If none then canSync = true;
     */
    ReviewNote.list({workOrder: wo})
        .then((notes) => {
            let canSync = true;
            /**
             * If the Manager is submitting
             * And hasn't left any notes to make changes
             * SYNC
             */
            notes.forEach((note) => {
                if (note.user === identity.username && identity.role === 'manager') {
                    canSync = false;
                }
            });
            /*
            * Obviously need to not sync if billable.
            * */
            if (body.billingInfo.billableToCustomer) {
                canSync = false;
            }
            /**
             * ------------------- sec: 1 --------------------------
             * ("manager")
             * ((!managerApproved || !timeApproved) && !netsuiteSyned)
             *
             * This will simply update the WO to manager approved
             * But if the WO has no notes. Sync to Netsuite
             * Unless Indirect then (Pretend) sync
             *
             * if () {
             */
            if ((!body.managerApproved || !body.timeApproved) && identity.role ===
                'manager') {
                // log.error('CTRL (258) fn:update [MANAGER]');
                if (canSync) {
                    // log.error('CTRL (259) fn:update !managerApproved canSync
                    // ->fn:UpdateToSync->fn:updateDoc');
                    return WorkOrder.UpdateToSync(id, body, identity)
                        .then((updatedDoc) => WorkOrder.updateDoc(id, updatedDoc,
                            identity));
                } else {
                    // log.error('CTRL (263) fn:update !managerApproved !canSync
                    // ->fn:managerApprove');
                    return WorkOrder.managerApprove(id, identity);
                }
                /**
                 * -----------------------------------------------------
                 * ("admin")
                 *
                 * All admin operations here. For updating and Submitting
                 *
                 * } else if () {
                 */
            } else if (identity.role === 'admin') {
                // log.error('CTRL (275) fn:update [ADMIN]');
                /**
                 * ------------------- sec: 2 (Update Only)-------------
                 * ("admin")
                 * ((!managerApproved || !timeApproved) && !netsuiteSyned)
                 *
                 * Updates the WO to Admin Approved. Does not Sync
                 *
                 * if () {
                 */
                if ((!body.managerApproved || !body.timeApproved) &&
                    !body.netsuiteSyned) {
                    // log.error('CTRL (287) fn:update !manager !netsuiteSyned
                    // ->fn:simpleUpdateAndApprove');
                    return WorkOrder.simpleUpdateAndApprove(id, body, identity);

                    /**
                     * ------------------- sec: 3 (Update Only)-----------
                     * ("admin")
                     * ((managerApproved || timeApproved) && !netsuiteSyned)
                     *
                     * Just for making additional Updates. Will not Sync
                     *
                     * } else if () {
                     */
                } else if ((body.managerApproved && body.timeApproved) &&
                    !body.netsuiteSyned) {
                    // log.error('CTRL (301) fn:update Manager !netsuiteSyned ->fn:updateDoc');
                    return WorkOrder.updateDoc(id, body, identity);

                    /**
                     * ------------------- sec: 4 ------------------------
                     * ("admin")
                     * ((!managerApproved || !timeApproved) && netsuiteSyned)
                     *
                     * Just for making additional Updates. Will Sync
                     *
                     * } else if () {
                     */
                } else if ((!body.managerApproved && !body.timeApproved) &&
                    body.netsuiteSyned) {
                    // log.error('CTRL (315) fn:update !manager NetsuiteSyned
                    // ->fn:UpdateToSync->fn:updateDoc');
                    return WorkOrder.UpdateToSync(id, body, identity)
                        .then((updatedDoc) => WorkOrder.updateDoc(id, updatedDoc,
                            identity));

                    /**
                     * ------------------- sec: 5 ------------------------
                     * ("admin")
                     * ((managerApproved || timeApproved) && netsuiteSyned)
                     *
                     * Sync but no need to approve
                     *
                     * } else if () {
                     */
                } else if (body.managerApproved && body.timeApproved &&
                    body.netsuiteSyned) {
                    // log.error('CTRL (330) fn:update ManagerApproved NetsuiteSyned
                    // ->fn:UpdateToSync->fn:updateDoc');
                    return WorkOrder.UpdateToSync(id, body, identity)
                        .then((updatedDoc) => WorkOrder.updateDoc(id, updatedDoc,
                            identity));
                    /**
                     * ------------------- sec: 6 ------------------------
                     * ("admin")
                     *
                     * Just try and update otherwise
                     *
                     * } else {
                     */
                } else {
                    // log.error('CTRL (342) fn:update else ->fn:updateDoc');
                    return WorkOrder.updateDoc(id, body, identity);

                }
            }
        })
        .then(res.resolve)
        .catch(res.reject);
};

/*
  Delete WorkOrder
   - Desc: Delete single document or array of _id's
*/
WorkOrderCtrl.delete = (req, res) => {
    const {params: {id}, identity} = req;

    if (!identity) return res.reject(
        new AuthError('You are not authenticated'));
    if (identity.role !== 'admin') return res.reject(
        new AuthError('Not Authorized'));
    if (!id) return res.reject(new ClientError('Missing id parameter'));

    WorkOrder.delete(id).then(res.resolve).catch(res.reject);
};

WorkOrderCtrl.unapprovedByAreaM = (req, res) => {
    const {query: params} = req;
    const users = params.users;

    WorkOrder.unapprovedByArea(users)
        .then(res.resolve)
        .catch(res.reject);
};

WorkOrderCtrl.unapprovedByUserM = (req, res) => {
    const {query: params} = req;
    const users = params.users;
    WorkOrder.unapprovedByUser(users)
        .then(res.resolve)
        .catch(res.reject);
};

WorkOrderCtrl.payrollDump = (req, res) => {
    const {query: params, identity} = req;
    log.trace({identity: identity}, 'Indentified as');
    if (!identity) return res.reject(new AuthError('Not authenticated'));
    if (identity.role !== 'admin') return res.reject(
        new AuthError('Not Authorized'));

    const options = Options(params, false);
    try {
        if (params.from) {
            options.from = new Date(params.from);
        }
        if (params.to) {
            options.to = new Date(params.to);
        }
        if (options.searchSupervisor) {
            User.getTechsForSupervisor(options.searchSupervisor).
                then((techs) => {
                    if (!techs) techs = [options.searchSupervisor];
                    log.trace({techs: techs},
                        'Admin Search for Techs for Supervisor report');
                    options.supervised = techs;
                    return WorkOrder.woPayrollDump(options);
                }).
                then((result) => {
                    res.downloadable('payrollDump.tsv', 'text/tsv', result);
                }).
                catch(res.reject);
        } else {
            WorkOrder.woPayrollDump(options)
                .then(result => {
                    res.downloadable('payrollDump.tsv', 'text/tsv', result);
                }).catch(res.reject);
        }
    } catch (e) {
        log.warn('Failed to parse params into date');
        res.reject(e);
    }
};

/**
 * ADMINS ONLY
 * -> returns a downloadable csv of the searched workOrders. no limit
 * @param req
 * @param res
 */
WorkOrderCtrl.woDump = (req, res) => {
    const {query: params, identity} = req;
    log.trace({identity: identity}, 'Indentified as');
    if (!identity) return res.reject(new AuthError('Not authenticated'));
    if (identity.role !== 'admin') return res.reject(
        new AuthError('Not Authorized'));

    const options = Options(params, false);
    try {
        if (params.from) {
            options.from = new Date(params.from);
        }
        if (params.to) {
            options.to = new Date(params.to);
        }
        if (options.searchSupervisor) {
            User.getTechsForSupervisor(options.searchSupervisor).
                then((techs) => {
                    if (!techs) techs = [options.searchSupervisor];
                    log.trace({techs: techs},
                        'Admin Search for Techs for Supervisor report');
                    options.supervised = techs;
                    return WorkOrder.woDumpReport(options);
                }).
                then((result) => {
                    res.downloadable('woDump.tsv', 'text/tsv', result);
                }).
                catch(res.reject);
        } else {
            WorkOrder.woDumpReport(options).then(result => {
                res.downloadable('woDump.tsv', 'text/tsv', result);
            }).catch(res.reject);
        }
    } catch (e) {
        log.warn('Failed to parse params into date');
        res.reject(e);
    }
};

/**
 * ADMINS ONLY
 * -> returns a downloadable csv parts of the searched workOrders. no limit
 * @param req
 * @param res
 */
WorkOrderCtrl.woPartDump = (req, res) => {
    const {query: params, identity} = req;
    log.trace({identity: identity}, 'Indentified as');
    if (!identity) return res.reject(new AuthError('Not authenticated'));
    if (identity.role !== 'admin') return res.reject(
        new AuthError('Not Authorized'));

    const options = Options(params, false);
    try {
        if (params.from) {
            options.from = new Date(params.from);
        }
        if (params.to) {
            options.to = new Date(params.to);
        }
        if (options.searchSupervisor) {
            User.getTechsForSupervisor(options.searchSupervisor).
                then((techs) => {
                    if (!techs) techs = [options.searchSupervisor];
                    log.trace({techs: techs},
                        'Admin Search for Techs for Supervisor report');
                    options.supervised = techs;
                    return WorkOrder.woPartsDumpReport(options);
                }).
                then((result) => {
                    res.downloadable('woPartsDump.tsv', 'text/tsv', result);
                }).
                catch(res.reject);
        } else {
            WorkOrder.woPartsDumpReport(options).then(result => {
                res.downloadable('woPartsDump.tsv', 'text/tsv', result);
            }).catch(res.reject);
        }
    }
    catch (e) {
        log.warn('Failed to parse params into date');
        res.reject(e);
    }
};

const Options = (params, role) => {
    const sorting = {
        sort:             params.sort || '-updated_at',
        type:             params.type || null,
        pm:               (params.pm !== null && params.pm !== undefined) ? params.pm : null,
        supervised:       [],
        billed:           params.billed || null,
        billable:         params.billable || null,
        billParts:        params.billParts || null,
        unit:             params.unit || null,
        tech:             params.tech || null,
        loc:              params.loc || null,
        cust:             params.cust || null,
        unapproved:       params.unapproved || false,
        approved:         params.approved || false,
        synced:           params.synced || false,
        searchSupervisor: params.searchSupervisor || null,
        limit:            +params.limit || 50,
        skip: +params.skip || 0,
        role: role || null
    };
    if (role !== false) {
        if (role === 'manager') {
            sorting.sort = params.sort || 'updated_at';
        } else {
            sorting.sort = params.sort || '-updated_at';
        }
    } else {
        delete sorting.limit;
        delete sorting.skip;
        delete sorting.role;
    }
    return sorting;
};


module.exports = WorkOrderCtrl;
