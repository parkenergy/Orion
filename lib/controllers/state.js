/* Controller
--- State ---




Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
// 'use strict';

const State     = require('../models/state'),
  ClientError   = require('../errors/client');

const StateCtrl = {};

/*
  Create State
    - Desc: takes single document or array of documents to insert
*/

StateCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  State.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/**
 * Query nsids for items to sync
 * @param req
 * @param res
 */
StateCtrl.clientSync = (req, res) => {
  const params = req.query;
  const options = {
    id: params.ids,
  };
  State.sync(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  List State
   - Desc: List documents per parameters provided
*/
StateCtrl.list = (req, res) => {
  const params = req.query;

  const options = {
    limit: +params.limit || null,
    skip: +params.skip || null,
    sort: params.sort || null,
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
StateCtrl.read = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  State.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update State
   - Desc: Update single document or array
*/
StateCtrl.update = (req, res) => {
  const { body, params: {id} } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  State.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete State
   - Desc: Delete single document or array of _id's
*/
StateCtrl.delete = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  State.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = StateCtrl;
