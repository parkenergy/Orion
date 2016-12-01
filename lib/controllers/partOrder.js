/* Controller
--- PartOrder ---

Order for parts


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var PartOrder = require('../models/partOrder'),
    log       = require('../helpers/logger'),
  ClientError = require('../errors/client');

var PartOrderCtrl = {};

/*
  Create PartOrder
    - Desc: takes single document or array of documents to insert
*/

PartOrderCtrl.create = function(req, res) {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  PartOrder.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List PartOrder
   - Desc: List documents per parameters provided
*/
PartOrderCtrl.list = function(req, res) {
  var params = req.query;

  var options = {
    sort: params.sort    || null,
    limit: +params.limit || 50,
    skip: +params.skip   || null,
    from: params.from    || null,
    to:   params.to      || null,
    //status filters
    status: {
      pending: params.pending         || true,
      backordered: params.backordered || false,
      shipped: params.shipped         || false,
      completed: params.completed     || false,
      canceled: params.canceled       || false
    }
  };

  try {
    if ( params.from ) {
      options.from = new Date(decodeURIComponent(params.from));
    }
    if ( params.to ) {
      options.to = new Date(decodeURIComponent(params.to));
    }

    PartOrder.list(options)
      .then(res.resolve)
      .catch(res.reject);
  }
  catch(e) {
    log.warn('Failed to parse params into date');
    res.reject(e);
  }
};

/*
  Read PartOrder
   - Desc: Retrieve document by _id
*/
PartOrderCtrl.read = function(req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  PartOrder.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update PartOrder
   - Desc: Update single document or array
*/
PartOrderCtrl.update = function(req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  PartOrder.updateDoc(id, body)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Delete PartOrder
   - Desc: Delete single document or array of _id's
*/
PartOrderCtrl.delete = function(req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  PartOrder.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = PartOrderCtrl;
