'use strict';

const router = require('express').Router();
const ActivityTypesCtrl = require('../controllers/activityType');

router.route('/api/ActivityTypes')
    .get(ActivityTypesCtrl.list);

module.exports = (app) => {
    app.use(router)
};
