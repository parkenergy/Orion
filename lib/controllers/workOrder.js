/* Controller
--- WorkOrder ---

An order of work information


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var WorkOrder = require('../models/workOrder'),
  User        = require('../models/user'),
  log         = require('../helpers/logger'),
  ClientError = require('../errors/client'),
  AuthError = require('../errors/auth');

var WorkOrderCtrl = {};

/*
  Create WorkOrder
    - Desc: takes single document or array of documents to insert
*/

WorkOrderCtrl.create = function (req, res) {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  WorkOrder.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List WorkOrder
   - Desc: List documents per parameters provided
*/
WorkOrderCtrl.list = function (req, res) {
  var params = req.query;
  var identity = req.identity;

  log.trace({identity: identity}, "Indentified as");

  if(!identity) return res.reject(new AuthError("Not authenticated"));

  var options = {
    sort:       params.sort       || '-updated_at',
    report:     params.report     || null,
    supervised:                      [],
    billable:   params.billable   || null,
    billParts:  params.billParts  || null,
    unit:       params.unit       || null,
    tech:       params.tech       || null,
    loc:        params.loc        || null,
    cust:       params.cust       || null,
    unapproved: params.unapproved || false,
    approved:   params.approved   || false,
    synced:     params.synced     || false,
    limit:      +params.limit     || 50,
    skip:       +params.skip      || 0
  };

  try {
    if (params.from) {
      options.from =
        new Date(decodeURIComponent(params.from));
    }
    if (params.to) {
      options.to = new Date(decodeURIComponent(params.to));
    }

    if(identity.role === 'manager') {
      User.getTechsForSupervisor(identity.username)
        .then(function (techs) {
          log.trace({techs: techs}, "Techs for Supervisor");
          if(techs.length > 0){
            options.supervised = techs;
            return WorkOrder.list(options);
          }

        })
        .then(res.resolve)
        .catch(res.reject);
    }
    else if(identity.role === 'admin'){
      WorkOrder.list(options)
        // If report flag is set then send file as a downloadable CSV
        .then(function (result) {
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
WorkOrderCtrl.read = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  WorkOrder.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update WorkOrder
   - Desc: Update single document or array
*/
WorkOrderCtrl.update = function (req, res) {
  var body = req.body;
  var id = req.params.id;
  var identity = req.identity;

  if(!identity) return res.reject(new AuthError("You are not authenticated"));
  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));
  if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("You do not have the privileges to update this resource"));

  if(!body.managerApproved || !body.timeApproved) {
    WorkOrder.managerApprove(id, identity)
      .then(res.resolve)
      .catch(res.reject);
  } else if(identity.role === "admin"){
    WorkOrder.updateDoc(id, body, identity)
      .then(res.resolve)
      .catch(res.reject);
  }
};

/*
  Delete WorkOrder
   - Desc: Delete single document or array of _id's
*/
WorkOrderCtrl.delete = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  WorkOrder.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = WorkOrderCtrl;
