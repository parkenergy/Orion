/**
 *            statusType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var StatusType   = require('../models/statusType');

var StatusTypesCtrl = {};

/*
 * List all Activity Types
 * */

StatusTypesCtrl.list = function (req, res) {
  StatusType.list()
  .then(res.resolve)
  .catch(res.reject);
};

module.exports = StatusTypesCtrl;
