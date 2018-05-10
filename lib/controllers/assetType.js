// 'use strict';

const AssetType = require('../models/assetType'),
      ClientError         = require('../errors/client');

const AssetTypeCtrl = {};

/*
 Create AssetType
 - Desc: takes single document or array of documents to insert
 */

AssetTypeCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  AssetType.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject);
};

/**
 * Query nsids for items to sync
 * @param req
 * @param res
 */
AssetTypeCtrl.clientSync = (req, res) => {
  const params = req.query;
  const options = {
    netsuiteId: params.netsuiteIds,
  };
  AssetType.sync(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
 List AssetType
 - Desc: List documents per parameters provided
 */
AssetTypeCtrl.list = (req, res) => {
  const params = req.query;

  const options = {
    sort: params.sort || null,
    page: +params.page || null,
    size: +params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  AssetType.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
 Read AssetType
 - Desc: Retrieve document by _id
 */
AssetTypeCtrl.read = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  AssetType.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
 Update AssetType
 - Desc: Update single document or array
 */
AssetTypeCtrl.update = (req, res) => {
  const { body, params: {id} } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  AssetType.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
 Delete AssetType
 - Desc: Delete single document or array of _id's
 */
AssetTypeCtrl.delete = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  AssetType.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = AssetTypeCtrl;
