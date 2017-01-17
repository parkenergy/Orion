/**
 *            unitType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

const UnitType   = require('../models/unitType');

const UnitTypesCtrl = {};

/*
 * List all Activity Types
 * */

UnitTypesCtrl.list = (req, res) => {
  UnitType.list()
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = UnitTypesCtrl;
