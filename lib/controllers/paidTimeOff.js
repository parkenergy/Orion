'use strict';

const PaidTimeOff = require('../models/paidTimeOff'),
    log = require('../helpers/logger'),
    User = require('../models/user'),
    ClientError = require('../errors/client'),
    AuthError = require('../errors/auth');

const PaidTimeOffCtrl = {
    create (req, res) {
        if (!req.body) return res.reject(new ClientError('Missing body'));

        PaidTimeOff.createDoc(req.body)
            .then(res.resolve)
            .catch(res.reject);
    },

    list (req, res) {
        const {query: params, identity} = req;
        if (!identity) return res.reject(new AuthError('Not Authenticated'));

        const options = {
            sort:          params.sort || 'DateFrom',
            size:          +params.size || null,
            page:          +params.page || null,
            username:      params.username || null,
            type:          params.type || null,
            adminReviewed: params.adminReviewed || false,
            role:          identity.role || null,
            supervised:    [],
            status:        {
                pending:  params.pending || false,
                approved: params.approved || false,
                rejected: params.rejected || false,
            },
        };
        try {
            if (params.from) {
                options.from = new Date(decodeURIComponent(params.from));
            }
            if (params.to) {
                options.to = new Date(decodeURIComponent(params.to));
            }

            if (identity.role === 'manager') {
                User.getTechsForSupervisor(identity.username)
                    .then((techs) => {
                        if (!techs) techs = [];
                        techs.push(identity.username);
                        options.supervised = techs;
                        return PaidTimeOff.list(options);
                    })
                    .then(res.resolve)
                    .catch(res.reject);
            } else if (identity.role === 'admin') {
                PaidTimeOff.list(options)
                    .then(res.resolve)
                    .catch(res.reject);
            } else {
                return res.reject(new AuthError(
                    'You do not have the privileges to access this resource'));
            }
        } catch (e) {
            log.warn('Failed to parse params into date');
            res.reject(e);
        }
    },

    readPTO (req, res) {
        const {params: {ptoId}} = req;
        if (!ptoId) return res.reject(new ClientError('Missing ptoId parameter'));
        PaidTimeOff.fetchPTO(ptoId)
            .then(res.resolve)
            .catch(res.reject);
    },

    read (req, res) {
        const {params: {id}} = req;
        const identity = req.identity;
        log.trace({identity: identity}, 'User Identity');

        if (!identity) return res.reject(new AuthError('Not authenticated'));
        if (identity.role !== 'admin' && identity.role !==
            'manager') return res.reject(new AuthError('Not Authorized'));
        if (!id) return res.reject(new ClientError('Missing id parameter'));

        PaidTimeOff.fetch(id)
            .then(res.resolve)
            .catch(res.reject);
    },

    update (req, res) {
        const {body, params: {id}} = req;
        if (!body) return res.reject(new ClientError('Missing Body'));
        if (!id) return res.reject(new ClientError('Missing id parameter'));

        PaidTimeOff.updateDoc(id, body)
            .then(res.resolve)
            .catch(res.reject);
    },

    delete (req, res) {
        const id = req.params.id;
        if (!id) return res.reject(new ClientError('Missing id parameter'));

        PaidTimeOff.delete(id)
            .then(res.resolve)
            .catch(res.reject);
    },
};

module.exports = PaidTimeOffCtrl;
