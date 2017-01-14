/* Controller
--- Customer ---

Customer data


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const Customer  = require('../models/customer'),
  ClientError   = require('../errors/client');

const CustomerCtrl = {};

/*
  Create Customer
    - Desc: takes single document or array of documents to insert
*/

CustomerCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  Customer.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Customer
   - Desc: List documents per parameters provided
*/
CustomerCtrl.list = (req, res) => {
  const params = req.query;

  const options = {
    sort: params.sort || null,
    page: params.page || null,
    size: params.size || null,
    from: params.from || null,
    to:   params.to   || null
  };

  Customer.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read Customer
   - Desc: Retrieve document by _id
*/
CustomerCtrl.read = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Customer.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Customer
   - Desc: Update single document or array
*/
CustomerCtrl.update = (req, res) => {
  const { body, params: {id} } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Customer.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Customer
   - Desc: Delete single document or array of _id's
*/
CustomerCtrl.delete = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Customer.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = CustomerCtrl;
