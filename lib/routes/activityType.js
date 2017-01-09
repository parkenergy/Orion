/**
 *            activityTypes
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var router = require('express').Router();
var ActivityTypesCtrl = require('../controllers/activityType');

router.route('/api/ActivityTypes')
  .get(ActivityTypesCtrl.list);

module.exports = function(app) {
  app.use(router);
};
