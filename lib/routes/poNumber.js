'use strict';

const router = require('express').Router();
const PONumberCtrl = require('../controllers/poNumber');

router.route('/api/getPONumber')
  .get(PONumberCtrl.newPONumber);

router.route('/api/createPO')
  .post(PONumberCtrl.createPO);

module.exports = (app) => {
  app.use(router);
};
