'use strict';

var router = require('express').Router();
var AreaCtrl = require('../controllers/AreaCtrl');

router.route('/api/Areas')
  .get(AreaCtrl.list)
  .post(AreaCtrl.create);

router.route('/api/Areas/:id')
  .get(AreaCtrl.read)
  .put(AreaCtrl.update)
  .delete(AreaCtrl.delete);

module.exports = function(app) {
  app.use(router);
};