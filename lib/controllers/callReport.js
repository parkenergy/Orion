// 'use strict';

const CallReport    = require('../models/callReport'),
    log             = require('../helpers/logger'),
    ClientError     = require('../errors/client'),
    AuthError       = require('../errors/auth');

const CallReportCtrl = {};

/*
* Create CallReport
* - Desc: takes single document or array of docs to insert
* */

CallReportCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing call Report Body."));
  CallReport.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject);
};

/*
* List CallReport
* - Desc: List documents per parameters provided
*
* */

CallReportCtrl.list = (req, res) => {

  const { query: params, identity } = req;

  if(!identity) return res.reject(new AuthError("Not Authenticated"));

  const options = {
    sort:     params.sort     || '-callTime',
    limit:    +params.limit   || 50,
    skip:     +params.skip    || 0,
    username: params.username || null,
    customer: params.customer || null
  };

  try {
    if( params.from ) {
      options.from = new Date(decodeURIComponent(params.from));
    }
    if( params.to ) {
      options.to = new Date(decodeURIComponent(params.to));
    }

    if(identity.role === 'manager'){
      options.username = identity.username;

      CallReport.list(options)
                .then(res.resolve)
                .catch(res.reject);
    } else if( identity.role === 'admin'){

      CallReport.list(options)
                .then(res.resolve)
                .catch(res.reject);
    } else {
      return res.reject(new AuthError("You do not have the privileges to access call reports"));
    }
  }
  catch (e) {
    log.warn('Failed to parse params into date');
    res.reject(e);
  }
};

/*
* Read CallReport
* - Desc: Retrieve document by _id
*
* */

CallReportCtrl.read = (req, res) => {
  const { params: {id}, identity } = req;

  if(!identity) return res.reject(new AuthError("Not Authenticated"));
  if(!id) return res.reject(new ClientError("Missing CallReport ID parameter"));

  CallReport.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
* Update CallReport
* - Desc: Update single doc
*
* */

CallReportCtrl.update = (req, res) => {
  const { params: {id}, body, identity } = req;

  if(!identity) return res.reject(new AuthError("Not Authenticated"));
  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  CallReport.updateDoc(id, body)
  .then(res.resolve)
  .catch(res.reject);
};

/*
 Delete CallReport
 - Desc: Delete single document or array of _id's
 */
CallReportCtrl.delete = (req, res) => {
  const { params: {id}, identity } = req;

  if(!identity) return res.reject(new AuthError("Not Authenticated"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  CallReport.delete(id)
  .then(res.resolve)
  .catch(res.reject);
};

module.exports = CallReportCtrl;
