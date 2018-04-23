/* Controller
--- ApplicationType ---




Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const ApplicationType = require('../models/applicationType'),
  ClientError         = require('../errors/client');

const ApplicationTypeCtrl = {};

/*
  Create ApplicationType
    - Desc: takes single document or array of documents to insert
*/

ApplicationTypeCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  ApplicationType.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/**
 * Query nsids for items to sync
 * @param req
 * @param res
 */
ApplicationTypeCtrl.clientSync = (req, res) => {
  const params = req.query;
  const options = {
    netsuiteId: params.netsuiteIds,
  };
  ApplicationType.sync(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  List ApplicationType
   - Desc: List documents per parameters provided
*/
ApplicationTypeCtrl.list = (req, res) => {
  const params = req.query;

  const options = {
    sort: params.sort || null,
    page: +params.page || null,
    size: +params.size || null,
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
ApplicationTypeCtrl.read = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  ApplicationType.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update ApplicationType
   - Desc: Update single document or array
*/
ApplicationTypeCtrl.update = (req, res) => {
  const { body, params: {id} } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  ApplicationType.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete ApplicationType
   - Desc: Delete single document or array of _id's
*/
ApplicationTypeCtrl.delete = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  ApplicationType.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = ApplicationTypeCtrl;
