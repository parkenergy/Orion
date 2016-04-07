/* Controller
--- Area ---




Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var Area = require('../models/area');

var AreaCtrl = {};

/*
  Create Area
    - Desc: takes single document or array of documents to insert
*/

AreaCtrl.create = function(req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));

  Area.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Area
   - Desc: List documents per parameters provided
*/
AreaCtrl.list = function(req, res) {
  var params = req.query;

  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  Area.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read Area
   - Desc: Retrieve document by _id
*/
AreaCtrl.read = function(req, res) {
  var id = req.query.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  Area.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Area
   - Desc: Update single document or array
*/
AreaCtrl.update = function(req, res) {
  var body = req.body;
  var id = req.query.id;

  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));

  Area.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Area
   - Desc: Delete single document or array of _id's
*/
AreaCtrl.delete = function(req, res) {
  var id = req.query.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  Area.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = AreaCtrl;
