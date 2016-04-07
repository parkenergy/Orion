'use strict';

var router = require('express').Router();
var CountyCtrl = require('../controllers/county');

router.route('/api/Counties')
  .get(CountyCtrl.list)
  .post(CountyCtrl.create);

router.route('/api/Counties/:id')
  .get(CountyCtrl.read)
  .put(CountyCtrl.update)
  .delete(CountyCtrl.delete);

module.exports = function(app) {
  app.use(router);
};
