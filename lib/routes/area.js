// 'use strict';

const router = require('express').Router(),
  AreaCtrl   = require('../controllers/area');

router.route('/api/Areas')
  .get(AreaCtrl.list)
  .post(AreaCtrl.create);

router.route('/api/Areas/:id')
  .get(AreaCtrl.read)
  .put(AreaCtrl.update)
  .delete(AreaCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
