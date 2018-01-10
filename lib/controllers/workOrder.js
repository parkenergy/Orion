/* Controller
--- WorkOrder ---

An order of work information


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const WorkOrder = require('../models/workOrder'),
  User          = require('../models/user'),
  log           = require('../helpers/logger'),
  ClientError   = require('../errors/client'),
  AuthError     = require('../errors/auth');

const WorkOrderCtrl = {};

/*
  Create WorkOrder
    - Desc: takes single document or array of documents to insert
*/

WorkOrderCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  WorkOrder.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
* Count WorkOrder
*   - Desc: Get the count of WorkOrders in a query
*
*/

WorkOrderCtrl.authCount = (req, res) => {
  const { query: params, identity } = req;
  
  if(!identity) return res.reject(new AuthError("Not Authenticated"));
  
  log.trace({identity: identity}, "id");
  log.error({identity: identity}, "id");
  log.debug({identity: identity}, "id");
  console.log(identity)
  const options = Options(params, identity.role);
  
  try {
    if (params.from) {
      options.from = new Date(params.from);
    }
    if (params.to) {
      options.to = new Date(params.to);
    }
  
    if(identity.role === 'manager') {
      User.getTechsForSupervisor(identity.username)
          .then(techs => {
            if(!techs) techs = [identity.username];
      
            log.trace({techs: techs}, "Techs for Supervisor");
            options.supervised = techs;
            return WorkOrder._count(options);
          })
          .then(res.resolve)
          .catch(res.reject);
    } else if(identity.role === 'admin'){
      WorkOrder._count(options)
               .then(result => {
                 res.resolve(result)
               })
               .catch(res.reject);
    } else return res.reject(new AuthError("You do not have the privileges to access this resource"));
  } catch (e){
    log.warn("Failed to parse params into date");
    res.reject(e)
  }
};

WorkOrderCtrl.noAuthCount = (req, res) => {
  const {query: params} = req;
  const options = {
    sort: params.sort             || '-timeSubmitted',
    unit: params.unit             || null,
    billed: params.billed         || null,
    billable: params.billable     || null,
    billParts: params.billParts   || null,
    tech: params.tech             || null,
    loc: params.loc               || null,
    cust: params.cust             || null,
    unapproved: params.unapproved || false,
    approved: params.approved     || false,
    synced: params.synced         || false,
    limit:  +params.limit         || 10,
    skip:   +params.skip          || 0
  };
  if (params.from) {
    options.from = new Date(params.from);
  }
  if (params.to) {
    options.to = new Date(params.to);
  }
  
  WorkOrder._count(options)
    .then(res.resolve)
    .catch(res.reject);
  
};

/*
  List WorkOrder
   - Desc: List documents per parameters provided
*/
WorkOrderCtrl.list = (req, res) => {
  const { query: params, identity } = req;
  // The user needs to see all work order info no matter
  // their position.
  
  if(params.noSplitInfo) {
    identity.role = "admin";
  }
  log.trace({identity: identity}, "Indentified as");
  
  if(!identity) return res.reject(new AuthError("Not authenticated"));

  const options = Options(params, identity.role);
  
  try {
    if (params.from) {
      options.from = new Date(params.from);
    }
    if (params.to) {
      options.to = new Date(params.to);
    }
    
    if(identity.role === 'manager') {
      User.getTechsForSupervisor(identity.username)
        .then(techs => {
          if(!techs) techs = [identity.username];

          log.trace({techs: techs}, "Techs for Supervisor");
          options.supervised = techs;
          return WorkOrder.list(options);
        })
        .then(res.resolve)
        .catch(res.reject);
    }
    else if(identity.role === 'admin'){
      WorkOrder.list(options)
        // If report flag is set then send file as a downloadable CSV
        .then(result => {
          if(options.report) {
            res.downloadable("timeReport.csv", "text/csv", result);
          }
          else {
            res.resolve(result);
          }
        })
        .catch(res.reject);
    }
    else return res.reject(new AuthError("You do not have the privileges to access this resource"));
  }
  catch(e) {
    log.warn("Failed to parse params into date");
    res.reject(e)
  }
};

/*
  Read WorkOrder
   - Desc: Retrieve document by _id
*/
WorkOrderCtrl.read = (req, res) => {
  const { params: {id}, identity } = req;

  if(!identity) return res.reject(new AuthError("You are not authenticated"));
  if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  WorkOrder.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update WorkOrder
   - Desc: Update single document or array
*/
WorkOrderCtrl.update = (req, res) => {
  const {body, params: {id}, identity} = req;
  
  if (!identity) return res.reject(new AuthError("You are not authenticated"));
  if (identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));
  if (!body) return res.reject(new ClientError("Missing body"));
  if (!id) return res.reject(new ClientError("Missing id parameter"));
  if (identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("You do not have the privileges to update this resource"));
  
  if ((!body.managerApproved || !body.timeApproved) && identity.role !== "admin") {
    WorkOrder.managerApprove(id, identity)
             .then(res.resolve)
             .catch(res.reject);
  } else if (identity.role === "admin") {
    if ((!body.managerApprove || !body.timeApproved) && !body.netsuiteSyned) {
      WorkOrder.approveAndUpdate(id, body, identity)
        .then(res.resolve)
        .catch(res.reject);
    }
    else {
      WorkOrder.updateDoc(id, body, identity)
        .then(res.resolve)
        .catch(res.reject);
    }
  }
};

/*
  Delete WorkOrder
   - Desc: Delete single document or array of _id's
*/
WorkOrderCtrl.delete = (req, res) => {
  const { params: {id}, identity } = req;

  if(!identity) return res.reject(new AuthError("You are not authenticated"));
  if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  WorkOrder.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

WorkOrderCtrl.unapprovedByAreaM = (req, res) => {
  const {query: params} = req;
  const users = params.users;
  console.log('in contorller colling this unapproved')
  console.log(params);
  
  WorkOrder.unapprovedByArea(users)
    .then(res.resolve)
    .catch(res.reject);
};

const Options = (params, role) => {
  var sorting = {
    sort:         params.sort       || '-updated_at',
    report:       params.report     || null,
    type:         params.type       || null,
    supervised:   [],
    billed:       params.billed     || null,
    billable:     params.billable   || null,
    billParts:    params.billParts  || null,
    unit:         params.unit       || null,
    tech:         params.tech       || null,
    loc:          params.loc        || null,
    cust:         params.cust       || null,
    unapproved:   params.unapproved || false,
    approved:     params.approved   || false,
    synced:       params.synced     || false,
    limit:        +params.limit     || 50,
    skip:         +params.skip      || 0,
    role:         role              || null
  };
  if(role === "manager"){
    sorting.sort = params.sort || 'updated_at';
  } else {
    sorting.sort = params.sort || '-updated_at';
  }
  return sorting;
};

module.exports = WorkOrderCtrl;
