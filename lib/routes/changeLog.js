'use strict';

const router   = require('express').Router(),
  ChangeLogCtrl = require('../controllers/changeLog');

router.route('/api/Locations')
  .get(ChangeLogCtrl.list)
  .post(ChangeLogCtrl.create);

router.route('/api/Locations/:id')
  .get(ChangeLogCtrl.read)
  .put(ChangeLogCtrl.update)
  .delete(ChangeLogCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
