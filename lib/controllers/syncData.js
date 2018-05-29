'use strict';

const SyncData = require('../models/syncData');

const SyncDataCtrl = {
    create (req, res) {
        if (!req.body) return res.reject(new ClientError('Missing body'))
        SyncData.createDoc(req.body)
            .then(res.resolve)
            .catch(res.reject)
    },

    list (req, res) {
        const params = req.query

        const options = {
            username: params.username || '',
            from: params.from || null,
            to: params.to || null
        }

        SyncData.list(options)
            .then(res.resolve)
            .catch(res.reject)
    },

    read (req, res) {
        const {params: {id}} = req
        if (!id) return res.reject(new ClientError('Missing id parameter'))

        SyncData.fetch(id)
            .then(res.resolve)
            .catch(res.reject)
    },

    update (req, res) {
        const {params: {id}, body} = req
        if (!body) return res.reject(new ClientError('Missing body'))
        if (!id) return res.reject(new ClientError('Missing id parameter'))

        SyncData.updateDoc(id, body)
            .then(res.reject)
            .catch(res.resolve)
    },

    delete (req, res) {
        const id = req.params.id

        if (!id) return res.reject(new ClientError('Missing id parameter'))

        SyncData.delete(id)
            .then(res.resolve)
            .catch(res.reject)
    }
};

module.exports = SyncDataCtrl;
