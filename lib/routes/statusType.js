'use strict';

const router = require('express').Router();
const StatusTypesCtrl = require('../controllers/statusType');

router.route('/api/StatusTypes')
    .get(StatusTypesCtrl.list);

module.exports = (app) => {
    app.use(router)
};
