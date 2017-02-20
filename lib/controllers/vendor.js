/* Controller
--- Vendor ---

Parts Vendor


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const Vendor    = require('../models/vendor'),
  ClientError   = require('../errors/client');

const VendorCtrl = {};

/*
  Create Vendor
    - Desc: takes single document or array of documents to insert
*/

VendorCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  Vendor.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Vendor
   - Desc: List documents per parameters provided
*/
VendorCtrl.list = (req, res) => {
  const params = req.query;

  const options = {
    sort: params.sort   || null,
    /*page: +params.page || null,
    size: +params.size   || null,*/
    from: params.from   || null,
    to:   params.to     || null
  };

  Vendor.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read Vendor
   - Desc: Retrieve document by _id
*/
VendorCtrl.read = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Vendor.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Vendor
   - Desc: Update single document or array
*/
VendorCtrl.update = (req, res) => {
  const { body, params: {id} } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Vendor.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Vendor
   - Desc: Delete single document or array of _id's
*/
VendorCtrl.delete = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Vendor.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = VendorCtrl;
