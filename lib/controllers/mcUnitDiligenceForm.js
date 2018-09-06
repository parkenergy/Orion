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
            limit:      +params.limit || null,
            skip:       +params.skip || 0,
            unitNumber: params.unitNumber || '',
            reviewer:   params.reviewer || '',
        };

        if (params.from) {
            options.from = new Date(decodeURIComponent(params.from));
        }
        if (params.to) {
            options.to = new Date(decodeURIComponent(params.to));
        }
        MCUnitDiligenceForm.list(options)
            .then(res.resolve)
            .catch(res.reject);
    },

    noAuthCount (req, res) {
        const {query: params} = req
        const options = {
            unitNumber: params.unitNumber || '',
            reviewer:   params.reviewer || '',
        }

        if (params.from) {
            options.from = new Date(decodeURIComponent(params.from))
        }
        if (params.to) {
            options.to = new Date(decodeURIComponent(params.to))
        }
        MCUnitDiligenceForm._count(options)
            .then(res.resolve)
            .catch(res.reject)
    },

    read (req, res) {
        const {params: {id}} = req;
        if (!id) return res.reject(new ClientError('Missing unitNumber parameter\''));

        MCUnitDiligenceForm.fetch(id)
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

    report (req, res) {
        const {query: params} = req;
        const options = {};
        if (params.from) {
            options.from = new Date(params.from);
        }
        if (params.to) {
            options.to = new Date(params.to);
        }
        MCUnitDiligenceForm.mcUnitDiligenceFormsReport(options)
            .then((result) => {
                res.downloadable('MCUnitDiligenceReport.tsv', 'text/tsv', result);
            })
            .catch(res.reject);
    },
};

module.exports = MCUnitDiligenceFormCTRL;
