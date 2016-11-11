'use strict';

const router = require('express').Router(),
  InventoryTransferCtrl = require('../controllers/inventoryTransfer');

router.route('/api/InventoryTransfers')
  .get(InventoryTransferCtrl.list)
  .post(InventoryTransferCtrl.create);

router.route('/api/InventoryTransfers/:id')
  .get(InventoryTransferCtrl.read)
  .put(InventoryTransferCtrl.update)
  .delete(InventoryTransferCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
