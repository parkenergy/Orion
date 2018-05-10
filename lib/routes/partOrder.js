// 'use strict';

const router        = require('express').Router();
const PartOrderCtrl = require('../controllers/partOrder');

router.route('/api/PartOrders')
  .get(PartOrderCtrl.list)
  .post(PartOrderCtrl.create);

router.route('/api/PartOrders/:id')
  .get(PartOrderCtrl.read)
  .put(PartOrderCtrl.update)
  .delete(PartOrderCtrl.delete);

router.route('/api/PartOrders/:id/:poFormID')
  .get(PartOrderCtrl.readForm);

module.exports = (app) => {
  app.use(router);
};
