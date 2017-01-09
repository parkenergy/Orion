/**
 *            unitType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var UnitType   = require('../models/unitType');

var UnitTypesCtrl = {};

/*
 * List all Activity Types
 * */

UnitTypesCtrl.list = function (req, res) {
  UnitType.list()
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = UnitTypesCtrl;
