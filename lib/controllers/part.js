/* Controller
--- Part ---

A compressor parts


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const Part = require('../models/part'),
  ClientError = require('../errors/client');

const PartCtrl = {};

/*
  Create Part
    - Desc: takes single document or array of documents to insert
*/

PartCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  Part.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Part
   - Desc: List documents per parameters provided
*/
PartCtrl.list = (req, res) => {
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
PartCtrl.read = (req, res) => {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Part.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Part
   - Desc: Update single document or array
*/
PartCtrl.update = (req, res) => {
  var { body, params: {id} } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Part.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Part
   - Desc: Delete single document or array of _id's
*/
PartCtrl.delete = (req, res) => {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Part.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = PartCtrl;
