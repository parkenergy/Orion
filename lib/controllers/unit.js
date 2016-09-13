/* Controller
--- Unit ---

Compressor Unit


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var Unit      = require('../models/unit'),
  ClientError = require('../errors/client');

var UnitCtrl = {};

/*
  Create Unit
    - Desc: takes single document or array of documents to insert
*/

UnitCtrl.create = function (req, res) {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  Unit.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Unit
   - Desc: List documents per parameters provided
*/
UnitCtrl.list = function (req, res) {
  var params = req.query;

  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  Unit.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read Unit
   - Desc: Retrieve document by _id
*/
UnitCtrl.read = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Unit.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Unit
   - Desc: Update single document or array
*/
UnitCtrl.update = function (req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Unit.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Unit
   - Desc: Delete single document or array of _id's
*/
UnitCtrl.delete = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Unit.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = UnitCtrl;
