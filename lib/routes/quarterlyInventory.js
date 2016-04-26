'use strict';

var router = require('express').Router();
var QuarterlyInventoryCtrl = require('../controllers/quarterlyInventory');

router.route('/api/QuarterlyInventories')
  .get(QuarterlyInventoryCtrl.list)
  .post(QuarterlyInventoryCtrl.create);

router.route('/api/QuarterlyInventories/:id')
  .get(QuarterlyInventoryCtrl.read)
  .put(QuarterlyInventoryCtrl.update)
  .delete(QuarterlyInventoryCtrl.delete);

module.exports = function (app) {
  app.use(router);
};
