/* Controller
--- EditHistory ---

Edit history for workOrders


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const EditHistory = require('../models/editHistory');

const EditHistoryCtrl = {};

/*
  Create EditHistory
    - Desc: takes single document or array of documents to insert
*/

EditHistoryCtrl.create = (req, res) => {
  //res.reject(new Error("Not Allowed"));
  if(!req.body) return res.reject(new ClientError("Missing body"));

  EditHistory.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List EditHistory
   - Desc: List documents per parameters provided
*/
EditHistoryCtrl.list = (req, res) => {
  const params = req.query;

  const options = {
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
EditHistoryCtrl.read = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  EditHistory.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update EditHistory
   - Desc: Update single document or array
*/
EditHistoryCtrl.update = (req, res) => {
  res.reject(new Error("Not Allowed"));
};

/*
  Delete EditHistory
   - Desc: Delete single document or array of _id's
*/
EditHistoryCtrl.delete = (req, res) => {
  res.reject(new Error("Not Allowed"));
};

module.exports = EditHistoryCtrl;
