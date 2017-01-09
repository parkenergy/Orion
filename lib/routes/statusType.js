/**
 *            statusType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var router = require('express').Router();
var StatusTypesCtrl = require('../controllers/statusType');

router.route('/api/StatusTypes')
.get(StatusTypesCtrl.list);

module.exports = function(app) {
  app.use(router);
};
