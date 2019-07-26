'use strict'

const KillCode = require('../models/killCode')
const ClientError = require('../errors/client')

const KillCodeCtrl = {}

KillCodeCtrl.create = (req, res) => {
    if (!req.body) return res.reject(new ClientError('Missing Body'))

    KillCode.createDoc(req.body)
            .then(res.resolve)
            .catch(res.reject)
}

KillCodeCtrl.clientSync = (req, res) => {
    const params = req.query;
    const options = {
        netsuiteId: params.netsuiteId,
    }
    KillCode.sync(options)
            .then(res.resolve)
            .catch(res.reject)
}

KillCodeCtrl.list = (req, res) => {
    const params = req.query

    const options = {
        sort:  params.sort || null,
        limit: +params.limit || null,
        skip:  +params.skip || null,
        from:  params.from || null,
        to:    params.to || null
    }

    KillCode.list(options)
            .then(res.resolve)
            .catch(res.reject)
}

KillCodeCtrl.read = (req, res) => {
    const id = req.params.id
    if (!id) return res.reject(new ClientError('Missing id parameter'))

    KillCode.fetch(id)
            .then(res.resolve)
            .catch(res.reject)
}

KillCodeCtrl.update = (req, res) => {
    const {body, params: {id}} = req
    if (!body) return res.reject(new ClientError('Missing body'))
    if (!id) return res.reject(new ClientError('Missing id parameter'))

    KillCode.updateDoc(id, body)
            .then(res.reject)
            .catch(res.resolve)
}

KillCodeCtrl.delete = (req, res) => {
    const id = req.params.id

    if (!id) return res.reject(new ClientError('Missing id parameter'))

    KillCode.delete(id)
            .then(res.resolve)
            .catch(res.reject)
}

module.exports = KillCodeCtrl
