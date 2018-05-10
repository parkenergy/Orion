/* Controller
--- County ---

County of a state


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
// 'use strict';

const County    = require('../models/county'),
  ClientError   = require('../errors/client');

const CountyCtrl = {};

/*
  Create County
    - Desc: takes single document or array of documents to insert
*/

CountyCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  County.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/**
 * Query nsids for items to sync
 * @param req
 * @param res
 */
CountyCtrl.clientSync = (req, res) => {
  const params = req.query;
  const options = {
    id: params.ids,
  };
  County.sync(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  List County
   - Desc: List documents per parameters provided
*/
CountyCtrl.list = (req, res) => {
  const params = req.query;

  if ((params.skip === undefined || params.skip === null) && (params.limit !== null && params.limit !== undefined)) {
    params.skip = 0;
  }
  const options = {
    sort: params.sort || null,
    limit: +params.limit || null,
    skip: (params.skip !== null ? (params.skip !== undefined? +params.skip : null) : null),
    from: params.from || null,
    to:   params.to   || null,
    regex: {
      name:   params.regexN       || null,
    }
  };

  County.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read County
   - Desc: Retrieve document by _id
*/
CountyCtrl.read = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  County.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update County
   - Desc: Update single document or array
*/
CountyCtrl.update = (req, res) => {
  const { body, params: {id} } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  County.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete County
   - Desc: Delete single document or array of _id's
*/
CountyCtrl.delete = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  County.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = CountyCtrl;
