/* Controller
--- Unit ---

Compressor Unit


Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
*/
'use strict';

const Unit      = require('../models/unit'),
  WorkOrder     = require('../models/workOrder'),
  ClientError   = require('../errors/client');

const UnitCtrl = {};

/*
  Create Unit
    - Desc: takes single document or array of documents to insert
*/

UnitCtrl.create = (req, res) => {
  if(!req.body) return res.reject(new ClientError("Missing body"));

  Unit.createDoc(req.body)
    .then(res.resolve)
    .catch(res.reject)
};

/*
  List Unit
   - Desc: List documents per parameters provided
*/
UnitCtrl.list = (req, res) => {
  const params = req.query;

  const options = {
    sort:       params.sort         || null,
    page:       +params.page        || null,
    size:       +params.size        || null,
    from:       params.from         || null,
    to:         params.to           || null,
    supervisor: params.supervisor   || null,
    number:     params.number       || null,
    customer:   params.customer     || null,
    tech:       params.tech         || null,
    pos:        params.pos          || null, // is an array [#,-#]
    radius:     params.radius       || null, // defaults to 50
    ne:         params.ne           || null, // its in the manager
    sw:         params.sw           || null,
    regex: {
      number:   params.regexN       || null,
      lease:    params.regexL       || null
    }
  };

  Unit.list(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
 List WorkOrders
  - Desc: List WorkOrders for Unit
 */

UnitCtrl.listWorkOrders = (req, res) => {
  const {query: params} = req;
  const options = {
    sort:   params.sort           || '-timeSubmitted',
    unit:   params.unit           || null,
    billed: params.billed         || null,
    billable: params.billable     || null,
    billParts: params.billParts   || null,
    tech: params.tech             || null,
    loc: params.loc               || null,
    cust: params.cust             || null,
    unapproved: params.unapproved || false,
    approved: params.approved     || false,
    synced: params.synced         || false,
    limit:  +params.limit         || 10,
    skip:   +params.skip          || 0
  };
  if (params.from) {
    options.from = new Date(params.from);
  }
  if (params.to) {
    options.to = new Date(params.to);
  }
  
  WorkOrder.getUnitWorkOrders(options)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Read Unit
   - Desc: Retrieve document by _id
*/
UnitCtrl.read = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Unit.fetch(id)
    .then(res.resolve)
    .catch(res.reject);
};

/*
  Update Unit
   - Desc: Update single document or array
*/
UnitCtrl.update = (req, res) => {
  const { body, params: {id} } = req;

  if(!body) return res.reject(new ClientError("Missing body"));
  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Unit.updateDoc(id, body)
    .then(res.reject)
    .catch(res.resolve);
};

/*
  Delete Unit
   - Desc: Delete single document or array of _id's
*/
UnitCtrl.delete = (req, res) => {
  const id = req.params.id;

  if(!id) return res.reject(new ClientError("Missing id parameter"));

  Unit.delete(id)
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = UnitCtrl;
