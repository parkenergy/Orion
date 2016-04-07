'use strict';

var router = require('express').Router();
var LocationCtrl = require('../controllers/location');

router.route('/api/Locations')
  .get(LocationCtrl.list)
  .post(LocationCtrl.create);

router.route('/api/Locations/:id')
  .get(LocationCtrl.read)
  .put(LocationCtrl.update)
  .delete(LocationCtrl.delete);

module.exports = function(app) {
  app.use(router);
};
