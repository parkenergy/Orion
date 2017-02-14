'use strict';

const router = require('express').Router();
const PmReportCtrl = require('../controllers/pmReport');

router.route('/api/PmReports')
      .get(PmReportCtrl.list)
      .post(PmReportCtrl.create);

router.route('/api/PmReports/:id')
      .get(PmReportCtrl.read)
      .put(PmReportCtrl.update)
      .delete(PmReportCtrl.delete);

module.exports = (app) => {
  app.use(router);
};

