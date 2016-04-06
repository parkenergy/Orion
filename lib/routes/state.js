'use strict';

var router = require('express').Router();
var StateCtrl = require('../controllers/StateCtrl');

router.route('/api/States')
  .get(StateCtrl.list)
  .post(StateCtrl.create);

router.route('/api/States/:id')
  .get(StateCtrl.read)
  .put(StateCtrl.update)
  .delete(StateCtrl.delete);

module.exports = function(app) {
  app.use(router);
};