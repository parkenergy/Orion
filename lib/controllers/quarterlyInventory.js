'use strict';

const QuarterlyInventory = require('../models/quarterlyInventory'),
    ClientError = require('../errors/client');

const QuarterlyInventoryCtrl = {};

/*
  Create QuarterlyInventory
    - Desc: takes single document or array of documents to insert
*/

QuarterlyInventoryCtrl.create = (req, res) => {
    if (!req.body) return res.reject(new ClientError('Missing body'));

    QuarterlyInventory.createDoc(req.body)
        .then(res.resolve).catch(res.reject);
};

/*

                sort: params.sort || null,
  List QuarterlyInventory
   - Desc: List documents per parameters provided
*/
QuarterlyInventoryCtrl.list = (req, res) => {
    const params = req.query;

    const options = {
        sort: params.sort({updated_at:1}),
        page: +params.page || null,
        size: +params.size || null,
        from: params.from || null,
        to: params.to || null
    };

    QuarterlyInventory.list(options)
        .then(res.resolve).catch(res.reject);
};

/*
  Read QuarterlyInventory
   - Desc: Retrieve document by _id
*/
QuarterlyInventoryCtrl.read = (req, res) => {
    const id = req.params.id;

    if (!id) return res.reject(new ClientError('Missing id parameter'));

    QuarterlyInventory.fetch(id)
        .then(res.resolve).catch(res.reject);
};

/*
  Update QuarterlyInventory
   - Desc: Update single document or array
*/
QuarterlyInventoryCtrl.update = (req, res) => {
    const {body, params: {id}} = req;

    if (!body) return res.reject(new ClientError('Missing body'));
    if (!id) return res.reject(new ClientError('Missing id parameter'));

    QuarterlyInventory.updateDoc(id, body)
        .then(res.reject).catch(res.resolve);
};

/*
  Delete QuarterlyInventory
   - Desc: Delete single document or array of _id's
*/
QuarterlyInventoryCtrl.delete = (req, res) => {
    const id = req.params.id;

    if (!id) return res.reject(new ClientError('Missing id parameter'));

    QuarterlyInventory.delete(id)
        .then(res.resolve).catch(res.reject);
};

module.exports = QuarterlyInventoryCtrl;
