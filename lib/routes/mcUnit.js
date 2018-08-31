'use strict';

const router     = require('express').Router(),
      MCUnitCTRL = require('../controllers/mcUnit');

router.route('/api/MCUnits')
    .get(MCUnitCTRL.list)
    .post(MCUnitCTRL.create);

router.route('/api/MCUnits/:id')
    .get(MCUnitCTRL.read)
    .put(MCUnitCTRL.update);

module.exports = (app) => {
    app.use(router);
    MCUnitCTRL.create([], {})
};
