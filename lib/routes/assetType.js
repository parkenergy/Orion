'use strict';

const router          = require('express').Router(),
  AssetTypeCtrl = require('../controllers/assetType');

router.route('/api/AssetTypes')
  .get(AssetTypeCtrl.list)
  .post(AssetTypeCtrl.create);

router.route('/api/AssetTypes/ClientSync')
  .get(AssetTypeCtrl.clientSync);

router.route('/api/AssetTypes/:id')
  .get(AssetTypeCtrl.read)
  .put(AssetTypeCtrl.update)
  .delete(AssetTypeCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
