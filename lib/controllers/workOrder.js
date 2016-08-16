/* Controller
--- WorkOrder ---

An order of work information


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var WorkOrder = require('../models/workOrder');
var User = require('../models/user');
var log = require('../helpers/logger');

var WorkOrderCtrl = {};

/*
  Create WorkOrder
    - Desc: takes single document or array of documents to insert
*/

WorkOrderCtrl.create = function (req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));

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

  var options = {
    sort:       params.sort       || '-updated_at',
    supervised: params.supervised || null,
    billable:   params.billable   || null,
    billParts:  params.billParts  || null,
    hideSynced: params.hideSynced || null,
    unit:       params.unit       || null,
    tech:       params.tech       || null,
    loc:        params.loc        || null,
    cust:       params.cust       || null,
    limit:      params.limit      || 50,
    skip:       params.skip       || 0
  };

  try {
    if (params.from) {
      options.from =
        new Date(decodeURIComponent(params.from));
    }
    if (params.to) {
      options.to =

        new Date(decodeURIComponent(params.to));
    }

    if(identity) {
      User.getTechsForSupervisor(identity.username)
        .then(function (techs) {
          log.trace({techs: techs}, "Techs for Supervisor");
          options.supervised = techs;
          return WorkOrder.list(options);
        })
        .then(res.resolve)
        .catch(res.reject);
    }
    else {
      WorkOrder.list(options)
        .then(res.resolve)
        .catch(res.reject);
    }
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

  if(!id) return res.reject(new Error("Missing id parameter"));

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

  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));

  WorkOrder.updateDoc(id, body)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Delete WorkOrder
   - Desc: Delete single document or array of _id's
*/
WorkOrderCtrl.delete = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  WorkOrder.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = WorkOrderCtrl;
