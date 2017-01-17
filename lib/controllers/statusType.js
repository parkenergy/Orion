/**
 *            statusType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

const StatusType   = require('../models/statusType');

const StatusTypesCtrl = {};

/*
 * List all Activity Types
 * */

StatusTypesCtrl.list = (req, res) => {
  StatusType.list()
  .then(res.resolve)
  .catch(res.reject);
};

module.exports = StatusTypesCtrl;
