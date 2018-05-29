'use strict';

const router = require('express').Router();
const UnitTypesCtrl = require('../controllers/unitType');

router.route('/api/UnitTypes')
    .get(UnitTypesCtrl.list);

module.exports = (app) => {
    app.use(router)
};

