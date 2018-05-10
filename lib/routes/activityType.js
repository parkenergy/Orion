/**
 *            activityType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
// 'use strict';

const router = require('express').Router();
const ActivityTypesCtrl = require('../controllers/activityType');

router.route('/api/ActivityTypes')
  .get(ActivityTypesCtrl.list);

module.exports = (app) => {
  app.use(router);
};
