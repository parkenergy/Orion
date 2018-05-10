// 'use strict';

const router = require('express').Router(),
  PartCtrl   = require('../controllers/part');

router.route('/api/Parts')
  .get(PartCtrl.list)
  .post(PartCtrl.create);

router.route('/api/Parts/ClientSync')
  .get(PartCtrl.clientSync);

router.route('/api/Parts/:id')
  .get(PartCtrl.read)
  .put(PartCtrl.update)
  .delete(PartCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
