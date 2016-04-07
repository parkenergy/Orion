/* Controller
--- State ---




Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var State = require('../models/state');

var StateCtrl = {};

/*
  Create State
    - Desc: takes single document or array of documents to insert
*/

StateCtrl.create = function(req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));
  
  State.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List State
   - Desc: List documents per parameters provided
*/
StateCtrl.list = function(req, res) {
  var params = req.query;
  
  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };
  
  State.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read State
   - Desc: Retrieve document by _id
*/
StateCtrl.read = function(req, res) {
  var id = req.query.id;
  
  if(!id) return res.reject(new Error("Missing id parameter"));
  
  State.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update State
   - Desc: Update single document or array
*/
StateCtrl.update = function(req, res) {
  var body = req.body;
  var id = req.query.id;
  
  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));
  
  State.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete State
   - Desc: Delete single document or array of _id's
*/
StateCtrl.delete = function(req, res) {
  var id = req.query.id;
  
  if(!id) return res.reject(new Error("Missing id parameter"));
  
  State.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = StateCtrl;