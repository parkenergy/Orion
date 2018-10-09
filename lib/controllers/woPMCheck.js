'use strict'

const woPMCheck   = require('../models/woPMCheck'),
      ClientError = require('../errors/client')

const woPMCheckCtrl = {}

/*
  Create woPMCheck
    - Desc: takes single document or array of documents to insert
*/

woPMCheckCtrl.create = (req, res) => {
    if (!req.body) return res.reject(new ClientError('Missing body'))

    woPMCheck.createDoc(req.body)
             .then(res.resolve)
             .catch(res.reject)
}

/*
  List woPMCheck
   - Desc: List documents per parameters provided
*/
woPMCheckCtrl.list = (req, res) => {

    woPMCheck.list(req.query)
             .then(res.resolve)
             .catch(res.reject)
}

/*
  Read woPMCheck
   - Desc: Retrieve document by _id
*/
woPMCheckCtrl.read = (req, res) => {
    const id = req.params.id

    if (!id) return res.reject(new ClientError('Missing id parameter'))

    woPMCheck.fetch(id)
             .then(res.resolve)
             .catch(res.reject)
}

/*
  Update woPMCheck
   - Desc: Update single document or array
*/
woPMCheckCtrl.update = (req, res) => {
    const {body, params: {id}} = req

    if (!body) return res.reject(new ClientError('Missing body'))
    if (!id) return res.reject(new ClientError('Missing id parameter'))

    woPMCheck.updateDoc(id, body)
             .then(res.resolve)
             .catch(res.reject)
}

/*
  Delete woPMCheck
   - Desc: Delete single document or array of _id's
*/
/*woPMCheckCtrl.delete = (req, res) => {
    const id = req.params.id;

    if (!id) return res.reject(new ClientError('Missing id parameter'));

    woPMCheck.delete(id)
        .then(res.resolve)
        .catch(res.reject);
};*/

module.exports = woPMCheckCtrl
