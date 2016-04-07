/* Controller
--- WorkOrder ---

An order of work information


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var WorkOrder = require('../models/workOrder');
var log = require('../helpers/logger');

var WorkOrderCtrl = {};

/*
  Create WorkOrder
    - Desc: takes single document or array of documents to insert
*/

WorkOrderCtrl.create = function(req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));

  WorkOrder.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List WorkOrder
   - Desc: List documents per parameters provided
*/
WorkOrderCtrl.list = function(req, res) {
  var params = req.query;
  log.info(params, "List Workorders");

  var options = {
    sort: params.sort || '-update_at',
    limit: params.limit || 50,
    skip: params.skip || 0,
    from: params.from || null,
    to:   params.to   || null
  };

  WorkOrder.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read WorkOrder
   - Desc: Retrieve document by _id
*/
WorkOrderCtrl.read = function(req, res) {
  var id = req.query.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  WorkOrder.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update WorkOrder
   - Desc: Update single document or array
*/
WorkOrderCtrl.update = function(req, res) {
  var body = req.body;
  var id = req.query.id;

  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));

  WorkOrder.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete WorkOrder
   - Desc: Delete single document or array of _id's
*/
WorkOrderCtrl.delete = function(req, res) {
  var id = req.query.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  WorkOrder.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = WorkOrderCtrl;
