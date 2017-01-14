'use strict';

var router        = require('express').Router();
var PartOrderCtrl = require('../controllers/partOrder');

router.route('/api/PartOrders')
  .get(PartOrderCtrl.list)
  .post(PartOrderCtrl.create);

router.route('/api/PartOrders/:id')
  .get(PartOrderCtrl.read)
  .put(PartOrderCtrl.update)
  .delete(PartOrderCtrl.delete);

module.exports = function(app) {
  app.use(router);
};
