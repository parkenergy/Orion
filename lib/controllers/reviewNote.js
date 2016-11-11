/* Controller
--- ReviewNote ---

Notes for workorder review&#x2F;edit


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const ReviewNote = require('../models/reviewNote'),
  ClientError  = require('../errors/client'),
  AuthError    = require('../errors/auth');

const ReviewNoteCtrl = {};

/*
  Create ReviewNote
    - Desc: takes single document
*/

ReviewNoteCtrl.create = (req, res) => {
  var { body, identity } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!identity) return res.reject(new AuthError("You are not authenticated"));

  body.user = identity.username;

  ReviewNote.createDoc(body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List ReviewNote
   - Desc: List documents per parameters provided
*/
ReviewNoteCtrl.list = (req, res) => {
  var params = req.query;

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
ReviewNoteCtrl.read = (req, res) => {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  ReviewNote.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update ReviewNote
   - Desc: Update single document or array
*/
ReviewNoteCtrl.update = (req, res) => {
  var { body, params: {id} } = req;

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
ReviewNoteCtrl.delete = (req, res) => {
  var id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  ReviewNote.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = ReviewNoteCtrl;
