'use strict';

const router                  = require('express').Router(),
      MCUnitDiligenceFormCTRL = require('../controllers/mcUnitDiligenceForm');

router.route('/api/MCUnitDiligenceForms')
    .get(MCUnitDiligenceFormCTRL.list)
    .post(MCUnitDiligenceFormCTRL.create);

router.route('/api/MCUnitDiligenceForms/:id')
    .get(MCUnitDiligenceFormCTRL.read)
    .put(MCUnitDiligenceFormCTRL.update);

module.exports = (app) => {
    app.use(router);
};
