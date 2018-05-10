/**
 *            activityType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

const ActivityType   = require('../models/activityType');

const ActivityTypesCtrl = {};

/*
* List all Activity Types
* */

ActivityTypesCtrl.list = (req, res) => {
  ActivityType.list()
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = ActivityTypesCtrl;
