'use strict';

const router   = require('express').Router(),
  LocationCtrl = require('../controllers/location');

router.route('/api/Locations')
  .get(LocationCtrl.list)
  .post(LocationCtrl.create);

router.route('/api/Locations/:id')
  .get(LocationCtrl.read)
  .put(LocationCtrl.update)
  .delete(LocationCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
