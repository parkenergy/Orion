'use strict';

var router = require('express').Router();
var WorkOrderCtrl = require('../controllers/workOrder');

router.route('/api/WorkOrders')
  .get(WorkOrderCtrl.list)
  .post(WorkOrderCtrl.create);

router.route('/api/WorkOrders/:id')
  .get(WorkOrderCtrl.read)
  .put(WorkOrderCtrl.update)
  .delete(WorkOrderCtrl.delete);

module.exports = function (app) {
  app.use(router);
};
