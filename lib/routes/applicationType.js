'use strict';

const router = require('express').Router(),
  ApplicationTypeCtrl = require('../controllers/applicationType');

router.route('/api/ApplicationTypes')
  .get(ApplicationTypeCtrl.list)
  .post(ApplicationTypeCtrl.create);

router.route('/api/ApplicationTypes/:id')
  .get(ApplicationTypeCtrl.read)
  .put(ApplicationTypeCtrl.update)
  .delete(ApplicationTypeCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
