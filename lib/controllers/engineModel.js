'use strict'

const EngineModel = require('../models/engineModel'),
      ClientError = require('../errors/client')

const EngineModelCtrl = {}

/*
  Create EngineModel
    - Desc: takes single document or array of documents to insert
*/

EngineModelCtrl.create = (req, res) => {
    if (!req.body) return res.reject(new ClientError('Missing body'))

    EngineModel.createDoc(req.body)
        .then(res.resolve)
        .catch(res.reject)
}

/**
 * Query nsids for items to sync
 * @param req
 * @param res
 */
EngineModelCtrl.clientSync = (req, res) => {
    const params = req.query
    const options = {
        netsuiteId: params.netsuiteIds,
    }
    EngineModel.sync(options)
        .then(res.resolve)
        .catch(res.reject)
}

/*
  List EngineModel
   - Desc: List documents per parameters provided
*/
EngineModelCtrl.list = (req, res) => {
    const params = req.query

    const options = {
        sort:  params.sort || null,
        skip:  +params.skip || null,
        limit: +params.limit || null,
        from:  params.from || null,
        to:    params.to || null,
    }

    EngineModel.list(options)
        .then(res.resolve)
        .catch(res.reject)
}

/*
  Read EngineModel
   - Desc: Retrieve document by _id
*/
EngineModelCtrl.read = (req, res) => {
    const id = req.params.id

    if (!id) return res.reject(new ClientError('Missing id parameter'))

    EngineModel.fetch(id)
        .then(res.resolve)
        .catch(res.reject)
}

/*
  Update EngineModel
   - Desc: Update single document or array
*/
EngineModelCtrl.update = (req, res) => {
    const {body, params: {id}} = req

    if (!body) return res.reject(new ClientError('Missing body'))
    if (!id) return res.reject(new ClientError('Missing id parameter'))

    EngineModel.updateDoc(id, body)
        .then(res.reject)
        .catch(res.resolve)
}

/*
  Delete EngineModel
   - Desc: Delete single document or array of _id's
*/
EngineModelCtrl.delete = (req, res) => {
    const id = req.params.id

    if (!id) return res.reject(new ClientError('Missing id parameter'))

    EngineModel.delete(id)
        .then(res.resolve)
        .catch(res.reject)
}

module.exports = EngineModelCtrl
