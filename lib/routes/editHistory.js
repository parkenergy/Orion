'use strict';

const router = require('express').Router(),
  EditHistoryCtrl = require('../controllers/editHistory');

router.route('/api/EditHistories')
  .get(EditHistoryCtrl.list)
  .post(EditHistoryCtrl.create);

router.route('/api/EditHistories/:id')
  .get(EditHistoryCtrl.read)
  .put(EditHistoryCtrl.update)
  .delete(EditHistoryCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
