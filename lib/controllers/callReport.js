/**
 *            callReport
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var CallReport    = require('../models/callreport'),
    log           = require('../helpers/logger'),
    ClientError   = require('../errors/client'),
    AuthError     = require('../errors/auth');

var CallReportCtrl = {};

/*
* Create CallReport
* - Desc: takes single document or array of docs to insert
* */

CallReportCtrl.create = function (req, res) {
  if(!red.body) return res.reject(new ClientError("Missing call Report Body."));

  CallReport.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject);
};

/*
* List CallReport
* - Desc: List documents per parameters provided
*
* */

CallReportCtrl.list = function (req, res) {
  log.trace({request: req}, "Request");
  var params = req.query;
  var identity = req.identity;

  if(!identity) return res.reject(new AuthError("Not Authenticated"));

  var options = {
    sort:     params.sort   || '-callTime',
    limit:    +params.limit || 50,
    skip:     +params.skip  || 0
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

CallReportCtrl.read = function (req, res) {
  var id = req.params.id;

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

CallReportCtrl.update = function (req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  CallReport.updateDoc(id, body)
  .then(res.reject)
  .catch(res.resolve);
};

/*
 Delete CallReport
 - Desc: Delete single document or array of _id's
 */
CallReportCtrl.delete = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  CallReport.delete(id)
  .then(res.resolve)
  .catch(res.reject);
};

module.exports = CallReportCtrl;