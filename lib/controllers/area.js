/* Controller
--- Area ---




Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const Area      = require('../models/area'),
  ClientError   = require('../errors/client');

const AreaCtrl = {};

/*
  Create Area
    - Desc: takes single document or array of documents to insert
*/

AreaCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  Area.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Area
   - Desc: List documents per parameters provided
*/
AreaCtrl.list = (req, res) => {
  const params = req.query;

  const options = {
    sort: params.sort || null,
    page: +params.page || null,
    size: +params.size || null,
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
AreaCtrl.read = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Area.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Area
   - Desc: Update single document or array
*/
AreaCtrl.update = (req, res) => {
  const { body, params: {id} } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Area.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Area
   - Desc: Delete single document or array of _id's
*/
AreaCtrl.delete = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Area.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = AreaCtrl;
