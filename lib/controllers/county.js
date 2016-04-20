/* Controller
--- County ---

County of a state


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var County = require('../models/county');

var CountyCtrl = {};

/*
  Create County
    - Desc: takes single document or array of documents to insert
*/

CountyCtrl.create = function(req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));

  County.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List County
   - Desc: List documents per parameters provided
*/
CountyCtrl.list = function(req, res) {
  var params = req.query;

  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  County.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read County
   - Desc: Retrieve document by _id
*/
CountyCtrl.read = function(req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  County.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update County
   - Desc: Update single document or array
*/
CountyCtrl.update = function(req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));

  County.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete County
   - Desc: Delete single document or array of _id's
*/
CountyCtrl.delete = function(req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  County.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = CountyCtrl;
