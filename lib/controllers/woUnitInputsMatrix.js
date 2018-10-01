'use strict'

const WOUnitInputsMatrix = require('../models/woUnitInputsMatrix'),
      ClientError        = require('../errors/client')

const WOUnitInputsMatrixCtrl = {}

/*
  Create WOUnitInputsMatrix
    - Desc: takes single document or array of documents to insert
*/

WOUnitInputsMatrixCtrl.create = (req, res) => {
    if (!req.body) return res.reject(new ClientError('Missing body'))

    WOUnitInputsMatrix.createDoc(req.body)
        .then(res.resolve)
        .catch(res.reject)
}

/*
  List WOUnitInputsMatrix
   - Desc: List documents per parameters provided
*/
WOUnitInputsMatrixCtrl.list = (req, res) => {

    WOUnitInputsMatrix.list(req.query)
        .then(res.resolve)
        .catch(res.reject)
}

/*
  Read WOUnitInputsMatrix
   - Desc: Retrieve document by _id
*/
WOUnitInputsMatrixCtrl.read = (req, res) => {
    const id = req.params.id

    if (!id) return res.reject(new ClientError('Missing id parameter'))

    WOUnitInputsMatrix.fetch(id)
        .then(res.resolve)
        .catch(res.reject)
}

/*
  Update WOUnitInputsMatrix
   - Desc: Update single document or array
*/
WOUnitInputsMatrixCtrl.update = (req, res) => {
    const {body, params: {id}} = req

    if (!body) return res.reject(new ClientError('Missing body'))
    if (!id) return res.reject(new ClientError('Missing id parameter'))

    WOUnitInputsMatrix.updateDoc(id, body)
        .then(res.resolve)
        .catch(res.reject)
}

/*
  Delete WOUnitInputsMatrix
   - Desc: Delete single document or array of _id's
*/
/*WOUnitInputsMatrixCtrl.delete = (req, res) => {
    const id = req.params.id;

    if (!id) return res.reject(new ClientError('Missing id parameter'));

    WOUnitInputsMatrix.delete(id)
        .then(res.resolve)
        .catch(res.reject);
};*/

module.exports = WOUnitInputsMatrixCtrl
