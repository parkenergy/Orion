'use strict';

const router   = require('express').Router(),
  CustomerCtrl = require('../controllers/customer');

router.route('/api/Customers')
  .get(CustomerCtrl.list)
  .post(CustomerCtrl.create);

router.route('/api/Customers/:id')
  .get(CustomerCtrl.read)
  .put(CustomerCtrl.update)
  .delete(CustomerCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
