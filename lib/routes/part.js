'use strict';

var router = require('express').Router();
var PartCtrl = require('../controllers/part');

router.route('/api/Parts')
  .get(PartCtrl.list)
  .post(PartCtrl.create);

router.route('/api/Parts/:id')
  .get(PartCtrl.read)
  .put(PartCtrl.update)
  .delete(PartCtrl.delete);

module.exports = function (app) {
  app.use(router);
};
