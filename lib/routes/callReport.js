'use strict';

const router = require('express').Router();
const CallReportCtrl = require('../controllers/callReport');

router.route('/api/CallReports')
    .get(CallReportCtrl.list)
    .post(CallReportCtrl.create);

router.route('/api/CallReports/:id')
    .get(CallReportCtrl.read)
    .put(CallReportCtrl.update)
    .delete(CallReportCtrl.delete);

module.exports = (app) => {
    app.use(router)
};
