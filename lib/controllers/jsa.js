/* Controller
--- Jsa ---

JSA forms


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var Jsa = require('../models/jsa');

var JsaCtrl = {};

/*
  Create Jsa
    - Desc: takes single document or array of documents to insert
*/

JsaCtrl.create = function (req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));

  Jsa.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Jsa
   - Desc: List documents per parameters provided
*/
JsaCtrl.list = function (req, res) {
  var params = req.query;

  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  Jsa.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read Jsa
   - Desc: Retrieve document by _id
*/
JsaCtrl.read = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  Jsa.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Jsa
   - Desc: Update single document or array
*/
JsaCtrl.update = function (req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));

  Jsa.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Jsa
   - Desc: Delete single document or array of _id's
*/
JsaCtrl.delete = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  Jsa.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = JsaCtrl;
