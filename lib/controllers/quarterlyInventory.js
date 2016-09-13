/* Controller
--- QuarterlyInventory ---

Quarterly Inventories


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var QuarterlyInventory = require('../models/quarterlyInventory'),
  ClientError          = require('../errors/client');

var QuarterlyInventoryCtrl = {};

/*
  Create QuarterlyInventory
    - Desc: takes single document or array of documents to insert
*/

QuarterlyInventoryCtrl.create = function (req, res) {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  QuarterlyInventory.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List QuarterlyInventory
   - Desc: List documents per parameters provided
*/
QuarterlyInventoryCtrl.list = function (req, res) {
  var params = req.query;

  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  QuarterlyInventory.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read QuarterlyInventory
   - Desc: Retrieve document by _id
*/
QuarterlyInventoryCtrl.read = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  QuarterlyInventory.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update QuarterlyInventory
   - Desc: Update single document or array
*/
QuarterlyInventoryCtrl.update = function (req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  QuarterlyInventory.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete QuarterlyInventory
   - Desc: Delete single document or array of _id's
*/
QuarterlyInventoryCtrl.delete = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  QuarterlyInventory.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = QuarterlyInventoryCtrl;
