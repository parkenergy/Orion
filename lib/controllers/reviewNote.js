/* Controller
--- ReviewNote ---

Notes for workorder review&#x2F;edit


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var ReviewNote = require('../models/reviewNote'),
  ClientError  = require('../errors/client'),
  AuthError    = require('../errors/auth');

var ReviewNoteCtrl = {};

/*
  Create ReviewNote
    - Desc: takes single document
*/

ReviewNoteCtrl.create = function(req, res) {
  var identity = req.identity;
  var body = req.body;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!identity) return res.reject(new AuthError("You are not authenticated"));
  if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));

  body.user = identity.username;

  ReviewNote.createDoc(body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List ReviewNote
   - Desc: List documents per parameters provided
*/
ReviewNoteCtrl.list = function(req, res) {
  var params = req.query;
  var identity = req.identity;

  if(!identity) return res.reject(new AuthError("You are not authenticated"));
  if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));

  var options = {
    workOrder: params.workOrder || null
  };

  ReviewNote.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read ReviewNote
   - Desc: Retrieve document by _id
*/
ReviewNoteCtrl.read = function(req, res) {
  var id = req.params.id;
  var identity = req.identity;

  if(!identity) return res.reject(new AuthError("You are not authenticated"));
  if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  ReviewNote.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update ReviewNote
   - Desc: Update single document or array
*/
ReviewNoteCtrl.update = function(req, res) {
  var body = req.body;
  var id = req.params.id;
  var identity = req.identity;

  if(!identity) return res.reject(new AuthError("You are not authenticated"));
  if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));
  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  ReviewNote.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete ReviewNote
   - Desc: Delete single document or array of _id's
*/
ReviewNoteCtrl.delete = function(req, res) {
  var id = req.params.id;
  var identity = req.identity;

  if(!identity) return res.reject(new AuthError("You are not authenticated"));
  if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  ReviewNote.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = ReviewNoteCtrl;
