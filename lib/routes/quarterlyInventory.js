'use strict';

const router = require('express').Router(),
  QuarterlyInventoryCtrl = require('../controllers/quarterlyInventory');

router.route('/api/QuarterlyInventories')
  .get(QuarterlyInventoryCtrl.list)
  .post(QuarterlyInventoryCtrl.create);

router.route('/api/QuarterlyInventories/:id')
  .get(QuarterlyInventoryCtrl.read)
  .put(QuarterlyInventoryCtrl.update)
  .delete(QuarterlyInventoryCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
