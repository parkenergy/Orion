'use strict';

const ChangeLog = require('../models/changeLog'),
    ClientError = require('../errors/client');

const ChangeLogCtrl = {
    create (req, res) {
        if (!req.body) return res.reject(new ClientError('Missing Body Change Log'))

        ChangeLog.createDoc(req.body)
            .then(res.resolve)
            .catch(res.reject)
    },

    list (req, res) {
        const params = req.query
        const Options = {
            sort: params.sort || null,
            skip: +params.skip || null,
            limit: +params.limit || null,
            from: params.from || null,
            to: params.to || null,
            name: params.name || '',
        }
        ChangeLog.list(Options)
            .then(res.resolve)
            .catch(res.reject)
    },

    read (req, res) {
        const id = req.params.id
        if (!id) return res.reject(new ClientError('Missing Id parameter for ChangeLog'))

        ChangeLog.fetch(id)
            .then(res.resolve)
            .catch(res.reject)
    },

    update (req, res) {
        const {body, params: {id}} = req

        if (!body) return res.reject(new ClientError('Missing body for changeLoc'))
        if (!id) return res.reject(new ClientError('Missing id parameter for changeLog'))

        ChangeLog.updateDoc(id, body)
            .then(res.resolve)
            .catch(res.reject)
    },

    delete (req, res) {
        const id = req.params.id
        if (!id) return res.reject(new ClientError('Missing id parameter for changeLog'))

        ChangeLog.delete(id)
            .then(res.resolve)
            .catch(res.reject)
    },

    /**
     * Here the client application during a sync requests here
     * which collections it needs to sync by sending the name
     * of the collection and the change types that happened
     * between the current sync time and their last.
     *
     * If however they have not synced from a particular computer
     * or it has been over a month since their last sync the
     * return object needs to be set so that the client
     * requests all items.
     *
     * return object -> {
     *  [collection]: {
     *    name: string, // collection name
     *    added: [all added],
     *    changed: [all changed],
     *    removed: [all removed],
     *  },
     * } || false
     * @param req
     * @param res
     */
    clientSync (req, res) {
        const {params: {username, hostName, compUser}} = req
        ChangeLog.getClientSyncItems(username, hostName, compUser)
            .then(res.resolve)
            .catch(res.reject)
    }
};

module.exports = ChangeLogCtrl;
