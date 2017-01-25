'use strict';

const PmReport        = require('../models/pmReport'),
      log             = require('../helpers/logger'),
      User            = require('../models/user'),
      ClientError     = require('../errors/client'),
      AuthError       = require('../errors/auth');

const PmReportCtrl = {};

/*
 * Create PmReport
 * - Desc: takes single document or array of docs to insert
 * */

PmReportCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing call Report Body."));
  
  PmReport.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject);
};

/*
 * List PmReport
 * - Desc: List documents per parameters provided
 *
 * */

PmReportCtrl.list = (req, res) => {
  
  const { query: params, identity } = req;
  
  if(!identity) return res.reject(new AuthError("Not Authenticated"));
  
  const options = {
    sort:     params.sort   || '-updated_at',
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
      User.getTechsForSupervisor(identity.username)
        .then(techs => {
          if(!techs) techs = [];
          
          // add current user as well.
          techs.push(identity.username);
          options.supervised = techs;
          
          return PmReport.list(options)
        })
        .then(res.resolve)
        .catch(res.reject);
    } else if( identity.role === 'admin'){
      PmReport.list(options)
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
 * Read PmReport
 * - Desc: Retrieve document by _id
 *
 * */

PmReportCtrl.read = (req, res) => {
  const { params: {id}} = req;

  if(!id) return res.reject(new ClientError("Missing PmReport ID parameter"));
  
  PmReport.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
 * Update PmReport
 * - Desc: Update single doc
 *
 * */

PmReportCtrl.update = (req, res) => {
  const { params: {id}, body} = req;
  
  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));
  
  PmReport.updateDoc(id, body)
    .then(res.resolve)
    .catch(res.reject);
};

/*
 Delete PmReport
 - Desc: Delete single document or array of _id's
 */
PmReportCtrl.delete = (req, res) => {
  const { params: {id}, identity } = req;
  
  if(!identity) return res.reject(new AuthError("Not Authenticated"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));
  
  PmReport.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = PmReportCtrl;

