/* Controller
--- EditHistory ---

Edit history for workOrders


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var EditHistory = require('../models/editHistory');

var EditHistoryCtrl = {};

/*
  Create EditHistory
    - Desc: takes single document or array of documents to insert
*/

EditHistoryCtrl.create = function(req, res) {
  res.reject(new Error("Not Allowed"));
};

/*
  List EditHistory
   - Desc: List documents per parameters provided
*/
EditHistoryCtrl.list = function(req, res) {
  var params = req.query;

  var options = {
    workOrder: params.workOrder || null
  };

  EditHistory.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read EditHistory
   - Desc: Retrieve document by _id
*/
EditHistoryCtrl.read = function(req, res) {
  var id = req.params.id;
  
  if(!id) return res.reject(new Error("Missing id parameter"));
  
  EditHistory.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update EditHistory
   - Desc: Update single document or array
*/
EditHistoryCtrl.update = function(req, res) {
  res.reject(new Error("Not Allowed"));
};

/*
  Delete EditHistory
   - Desc: Delete single document or array of _id's
*/
EditHistoryCtrl.delete = function(req, res) {
  res.reject(new Error("Not Allowed"));
};

module.exports = EditHistoryCtrl;
