/* Controller
--- Part ---

A compressor parts


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var Part = require('../models/part');

var PartCtrl = {};

/*
  Create Part
    - Desc: takes single document or array of documents to insert
*/

PartCtrl.create = function(req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));

  Part.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Part
   - Desc: List documents per parameters provided
*/
PartCtrl.list = function(req, res) {
  var params = req.query;

  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  Part.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read Part
   - Desc: Retrieve document by _id
*/
PartCtrl.read = function(req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  Part.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Part
   - Desc: Update single document or array
*/
PartCtrl.update = function(req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));

  Part.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Part
   - Desc: Delete single document or array of _id's
*/
PartCtrl.delete = function(req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  Part.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = PartCtrl;
