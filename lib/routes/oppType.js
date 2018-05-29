'use strict';

const router = require('express').Router();
const OppTypesCtrl = require('../controllers/oppType');

router.route('/api/OppTypes')
    .get(OppTypesCtrl.list);

module.exports = (app) => {
    app.use(router)
};
