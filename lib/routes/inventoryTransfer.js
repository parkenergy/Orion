'use strict';

var router = require('express').Router();
var InventoryTransferCtrl = require('../controllers/InventoryTransferCtrl');

router.route('/api/InventoryTransfers')
  .get(InventoryTransferCtrl.list)
  .post(InventoryTransferCtrl.create);

router.route('/api/InventoryTransfers/:id')
  .get(InventoryTransferCtrl.read)
  .put(InventoryTransferCtrl.update)
  .delete(InventoryTransferCtrl.delete);

module.exports = function(app) {
  app.use(router);
};