'use strict'

const woSOPTask   = require('../models/woSOPTask'),
      ClientError = require('../errors/client')

const woSOPTaskCtrl = {}

/*
  Create woSOPTask
    - Desc: takes single document or array of documents to insert
*/

woSOPTaskCtrl.create = (req, res) => {
    if (!req.body) return res.reject(new ClientError('Missing body'))

    woSOPTask.createDoc(req.body)
             .then(res.resolve)
             .catch(res.reject)
}

/*
  List woSOPTask
   - Desc: List documents per parameters provided
*/
woSOPTaskCtrl.list = (req, res) => {

    woSOPTask.list(req.query)
             .then(res.resolve)
             .catch(res.reject)
}

/*
  Read woSOPTask
   - Desc: Retrieve document by _id
*/
woSOPTaskCtrl.read = (req, res) => {
    const id = req.params.id

    if (!id) return res.reject(new ClientError('Missing id parameter'))

    woSOPTask.fetch(id)
             .then(res.resolve)
             .catch(res.reject)
}

/*
  Update woSOPTask
   - Desc: Update single document or array
*/
woSOPTaskCtrl.update = (req, res) => {
    const {body, params: {id}} = req

    if (!body) return res.reject(new ClientError('Missing body'))
    if (!id) return res.reject(new ClientError('Missing id parameter'))

    woSOPTask.updateDoc(id, body)
             .then(res.resolve)
             .catch(res.reject)
}

/*
  Delete woSOPTask
   - Desc: Delete single document or array of _id's
*/
/*woSOPTaskCtrl.delete = (req, res) => {
    const id = req.params.id;

    if (!id) return res.reject(new ClientError('Missing id parameter'));

    woSOPTask.delete(id)
        .then(res.resolve)
        .catch(res.reject);
};*/

module.exports = woSOPTaskCtrl
