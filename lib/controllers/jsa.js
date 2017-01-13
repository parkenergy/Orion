/* Controller
--- Jsa ---

JSA forms


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const Jsa       = require('../models/jsa'),
  ClientError = require('../errors/client');

const JsaCtrl = {};

/*
  Create Jsa
    - Desc: takes single document or array of documents to insert
*/

JsaCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  Jsa.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Jsa
   - Desc: List documents per parameters provided
*/
JsaCtrl.list = (req, res) => {
  const params = req.query;

  const options = {
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
JsaCtrl.read = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Jsa.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Jsa
   - Desc: Update single document or array
*/
JsaCtrl.update = (req, res) => {
  const { body, params: {id} } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Jsa.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Jsa
   - Desc: Delete single document or array of _id's
*/
JsaCtrl.delete = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Jsa.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = JsaCtrl;
