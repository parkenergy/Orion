'use strict';

const ActivityType   = require('../models/activityType');

const ActivityTypesCtrl = {};

/*
* List all Activity Types
* */

ActivityTypesCtrl.list = (req, res) => {
    ActivityType.list()
        .then(res.resolve)
        .catch(res.reject)
};

module.exports = ActivityTypesCtrl;
