'use strict';

var router = require('express').Router();
var ApplicationTypeCtrl = require('../controllers/ApplicationTypeCtrl');

router.route('/api/ApplicationTypes')
  .get(ApplicationTypeCtrl.list)
  .post(ApplicationTypeCtrl.create);

router.route('/api/ApplicationTypes/:id')
  .get(ApplicationTypeCtrl.read)
  .put(ApplicationTypeCtrl.update)
  .delete(ApplicationTypeCtrl.delete);

module.exports = function(app) {
  app.use(router);
};