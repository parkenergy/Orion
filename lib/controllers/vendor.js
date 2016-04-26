/* Controller
--- Vendor ---

Parts Vendor


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var Vendor = require('../models/vendor');

var VendorCtrl = {};

/*
  Create Vendor
    - Desc: takes single document or array of documents to insert
*/

VendorCtrl.create = function (req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));

  Vendor.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Vendor
   - Desc: List documents per parameters provided
*/
VendorCtrl.list = function (req, res) {
  var params = req.query;

  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  Vendor.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read Vendor
   - Desc: Retrieve document by _id
*/
VendorCtrl.read = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  Vendor.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Vendor
   - Desc: Update single document or array
*/
VendorCtrl.update = function (req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));

  Vendor.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Vendor
   - Desc: Delete single document or array of _id's
*/
VendorCtrl.delete = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  Vendor.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = VendorCtrl;
