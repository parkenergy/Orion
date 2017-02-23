'use strict';

const router    = require('express').Router(),
  WorkOrderCtrl = require('../controllers/workOrder');

router.route('/api/WorkOrders')
  .get(WorkOrderCtrl.list)
  .post(WorkOrderCtrl.create);

router.route('/api/WorkOrdersCount')
  .get(WorkOrderCtrl.__count);

router.route('/api/WorkOrders/:id')
  .get(WorkOrderCtrl.read)
  .put(WorkOrderCtrl.update)
  .delete(WorkOrderCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
