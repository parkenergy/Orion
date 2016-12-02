/* Controller
--- PartOrder ---

Order for parts


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var PartOrder = require('../models/partOrder'),
  log         = require('../helpers/logger'),
  User        = require('../models/user'),
  ClientError = require('../errors/client'),
  AuthError   = require('../errors/auth');

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
  var identity = req.identity;

  if(!identity) return res.reject(new AuthError("Not authenticated"));

  var options = {
    sort:  params.sort    || '-timeCreated',
    limit: +params.limit  || 50,
    skip:  +params.skip   || 0,
    supervised:              [],
    //status filters
    status: {
      pending:   params.pending         || false,
      backorder: params.backorder       || false,
      shipped:   params.shipped         || false,
      completed: params.completed       || false,
      canceled:  params.canceled        || false
    }
  };

  try {
    if ( params.from ) {
      options.from = new Date(decodeURIComponent(params.from));
    }
    if ( params.to ) {
      options.to = new Date(decodeURIComponent(params.to));
    }


    if(identity.role === 'manager') {
      User.getTechsForSupervisor(identity.username)
        .then(function (techs) {
          if(!techs) techs = [];

          options.supervised = techs;

          return PartOrder.list(options);
        })
        .then(res.resolve)
        .catch(res.reject);
    }
    else if(identity.role === 'admin') {
      PartOrder.list(options)
        .then(res.resolve)
        .catch(res.reject);
    }
    else return res.reject(new AuthError("You do not have the privileges to access this resource"));
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
  var identity = req.identity;

  log.trace({identity: identity}, "User identity");

  if(!identity) return res.reject(new AuthError("Not authenticated"));
  if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));
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
  var identity = req.identity;

  if(!identity) return res.reject(new AuthError("Not authenticated"));
  if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));
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
  res.reject(new ClientError("Not allowed to delete Part Order, set to Canceled or contact Administrator."));
};

module.exports = PartOrderCtrl;
