'use strict';

var router = require('express').Router();
var UnitCtrl = require('../controllers/unit');

router.route('/api/Units')
  .get(UnitCtrl.list)
  .post(UnitCtrl.create);

router.route('/api/Units/:id')
  .get(UnitCtrl.read)
  .put(UnitCtrl.update)
  .delete(UnitCtrl.delete);

module.exports = function (app) {
  app.use(router);
};
