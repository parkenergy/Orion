/* Controller
--- ApplicationType ---




Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var ApplicationType = require('../models/ApplicationType');

var ApplicationTypeCtrl = {};

/*
  Create ApplicationType
    - Desc: takes single document or array of documents to insert
*/

ApplicationTypeCtrl.create = function(req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));
  
  ApplicationType.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List ApplicationType
   - Desc: List documents per parameters provided
*/
ApplicationTypeCtrl.list = function(req, res) {
  var params = req.query;
  
  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };
  
  ApplicationType.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read ApplicationType
   - Desc: Retrieve document by _id
*/
ApplicationTypeCtrl.read = function(req, res) {
  var id = req.query.id;
  
  if(!id) return res.reject(new Error("Missing id parameter"));
  
  ApplicationType.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update ApplicationType
   - Desc: Update single document or array
*/
ApplicationTypeCtrl.update = function(req, res) {
  var body = req.body;
  var id = req.query.id;
  
  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));
  
  ApplicationType.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete ApplicationType
   - Desc: Delete single document or array of _id's
*/
ApplicationTypeCtrl.delete = function(req, res) {
  var id = req.query.id;
  
  if(!id) return res.reject(new Error("Missing id parameter"));
  
  ApplicationType.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = ApplicationTypeCtrl;