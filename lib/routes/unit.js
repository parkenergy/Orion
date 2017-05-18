'use strict';

const router = require('express').Router(),
  UnitCtrl   = require('../controllers/unit');

router.route('/api/Units')
  .get(UnitCtrl.list)
  .post(UnitCtrl.create);

router.route('/api/Units/:id')
  .get(UnitCtrl.read)
  .put(UnitCtrl.update)
  .delete(UnitCtrl.delete);

router.route('/api/Unit/Workorders')
  .get(UnitCtrl.listWorkOrders);

module.exports = (app) => {
  app.use(router);
};
