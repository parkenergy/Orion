/**
 *            unitType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var router = require('express').Router();
var UnitTypesCtrl = require('../controllers/unitType');

router.route('/api/UnitTypes')
.get(UnitTypesCtrl.list);

module.exports = function(app) {
  app.use(router);
};

