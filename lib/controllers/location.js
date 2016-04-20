/* Controller
--- Location ---

Job site location


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var Location = require('../models/location');

var LocationCtrl = {};

/*
  Create Location
    - Desc: takes single document or array of documents to insert
*/

LocationCtrl.create = function(req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));

  Location.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Location
   - Desc: List documents per parameters provided
*/
LocationCtrl.list = function(req, res) {
  var params = req.query;

  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  Location.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read Location
   - Desc: Retrieve document by _id
*/
LocationCtrl.read = function(req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  Location.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Location
   - Desc: Update single document or array
*/
LocationCtrl.update = function(req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));

  Location.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Location
   - Desc: Delete single document or array of _id's
*/
LocationCtrl.delete = function(req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  Location.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = LocationCtrl;
