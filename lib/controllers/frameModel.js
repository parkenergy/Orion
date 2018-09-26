'use strict'

const FrameModel  = require('../models/frameModel'),
      ClientError = require('../errors/client')

const FrameModelCtrl = {}

/*
  Create FrameModel
    - Desc: takes single document or array of documents to insert
*/

FrameModelCtrl.create = (req, res) => {
    if (!req.body) return res.reject(new ClientError('Missing body'))

    FrameModel.createDoc(req.body)
        .then(res.resolve)
        .catch(res.reject)
}

/**
 * Query nsids for items to sync
 * @param req
 * @param res
 */
FrameModelCtrl.clientSync = (req, res) => {
    const params = req.query
    const options = {
        netsuiteId: params.netsuiteIds,
    }
    FrameModel.sync(options)
        .then(res.resolve)
        .catch(res.reject)
}

/*
  List FrameModel
   - Desc: List documents per parameters provided
*/
FrameModelCtrl.list = (req, res) => {
    const params = req.query

    const options = {
        sort:  params.sort || null,
        skip:  +params.skip || null,
        limit: +params.limit || null,
        from:  params.from || null,
        to:    params.to || null,
    }

    FrameModel.list(options)
        .then(res.resolve)
        .catch(res.reject)
}

/*
  Read FrameModel
   - Desc: Retrieve document by _id
*/
FrameModelCtrl.read = (req, res) => {
    const id = req.params.id

    if (!id) return res.reject(new ClientError('Missing id parameter'))

    FrameModel.fetch(id)
        .then(res.resolve)
        .catch(res.reject)
}

/*
  Update FrameModel
   - Desc: Update single document or array
*/
FrameModelCtrl.update = (req, res) => {
    const {body, params: {id}} = req

    if (!body) return res.reject(new ClientError('Missing body'))
    if (!id) return res.reject(new ClientError('Missing id parameter'))

    FrameModel.updateDoc(id, body)
        .then(res.reject)
        .catch(res.resolve)
}

/*
  Delete FrameModel
   - Desc: Delete single document or array of _id's
*/
FrameModelCtrl.delete = (req, res) => {
    const id = req.params.id

    if (!id) return res.reject(new ClientError('Missing id parameter'))

    FrameModel.delete(id)
        .then(res.resolve)
        .catch(res.reject)
}

module.exports = FrameModelCtrl
