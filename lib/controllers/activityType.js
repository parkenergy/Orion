/**
 *            activityType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var ActivityType   = require('../models/activityType');

var ActivityTypesCtrl = {};

/*
* List all Activity Types
* */

ActivityTypesCtrl.list = function (req, res) {
  ActivityType.list()
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = ActivityTypesCtrl;