/* Controller
--- InventoryTransfer ---

Inventory transfers between locations


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var InventoryTransfer = require('../models/inventoryTransfer'),
  ClientError         = require('../errors/client');

var InventoryTransferCtrl = {};

/*
  Create InventoryTransfer
    - Desc: takes single document or array of documents to insert
*/

InventoryTransferCtrl.create = function (req, res) {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  InventoryTransfer.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List InventoryTransfer
   - Desc: List documents per parameters provided
*/
InventoryTransferCtrl.list = function (req, res) {
  var params = req.query;

  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  InventoryTransfer.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read InventoryTransfer
   - Desc: Retrieve document by _id
*/
InventoryTransferCtrl.read = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  InventoryTransfer.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update InventoryTransfer
   - Desc: Update single document or array
*/
InventoryTransferCtrl.update = function (req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  InventoryTransfer.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete InventoryTransfer
   - Desc: Delete single document or array of _id's
*/
InventoryTransferCtrl.delete = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  InventoryTransfer.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = InventoryTransferCtrl;
