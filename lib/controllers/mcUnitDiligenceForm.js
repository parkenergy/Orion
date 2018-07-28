'use strict';

const MCUnitDiligenceForm = require('../models/MCUnitDiligenceForm'),
      log                 = require('../helpers/logger'),
      ClientError         = require('../errors/client');

const MCUnitDiligenceFormCTRL = {
    create (req, res) {
        if (!req.body) return res.reject(new ClientError('Missing Body'));

        MCUnitDiligenceForm.createDoc(req.body)
            .then(res.resolve)
            .catch(res.reject);
    },

    list (req, res) {
        const {query: params} = req;
        const options = {
            limit:      +params.size || null,
            skip:       +params.skip || null,
            unitNumber: params.unitNumber || null,
        };
        MCUnitDiligenceForm.list(options)
            .then(res.resolve)
            .catch(res.reject);
    },

    read (req, res) {
        const {params: {unitNumber}} = req;
        if (!unitNumber) return res.reject(new ClientError('Missing unitNumber parameter\''));

        MCUnitDiligenceForm.fetch(unitNumber)
            .then(res.resolve)
            .catch(res.reject);
    },

    update (req, res) {
        const {body, params: {id}} = req;
        if (!body) return res.reject(new ClientError('Missing body'));
        if (!id) return res.reject(new ClientError('Missing id parameter'));

        MCUnitDiligenceForm.updateDoc(id, body)
            .then(res.resolve)
            .catch(res.reject);
    },
};

module.exports = MCUnitDiligenceFormCTRL;
