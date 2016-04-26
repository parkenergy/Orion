/* Controller
--- User ---

Orion User


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

var User = require('../models/user');

var UserCtrl = {};

/*
  Create User
    - Desc: takes single document or array of documents to insert
*/

UserCtrl.create = function (req, res) {
  if(!req.body) return res.reject(new Error("Missing body"));

  User.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List User
   - Desc: List documents per parameters provided
*/
UserCtrl.list = function (req, res) {
  var params = req.query;

  var options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  User.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read User
   - Desc: Retrieve document by _id
*/
UserCtrl.read = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  User.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update User
   - Desc: Update single document or array
*/
UserCtrl.update = function (req, res) {
  var body = req.body;
  var id = req.params.id;

  if(!body) return res.reject(new Error("Missing body"));
  if(!id) return res.reject(new Error("Missing id parameter"));

  User.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete User
   - Desc: Delete single document or array of _id's
*/
UserCtrl.delete = function (req, res) {
  var id = req.params.id;

  if(!id) return res.reject(new Error("Missing id parameter"));

  User.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = UserCtrl;
