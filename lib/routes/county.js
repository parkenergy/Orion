// 'use strict';

const router = require('express').Router(),
  CountyCtrl = require('../controllers/county');

router.route('/api/Counties')
  .get(CountyCtrl.list)
  .post(CountyCtrl.create);

router.route('/api/Counties/ClientSync')
  .get(CountyCtrl.clientSync);

router.route('/api/Counties/:id')
  .get(CountyCtrl.read)
  .put(CountyCtrl.update)
  .delete(CountyCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
