'use strict';

const StatusType   = require('../models/statusType');

const StatusTypesCtrl = {};

/*
 * List all Activity Types
 * */

StatusTypesCtrl.list = (req, res) => {
    StatusType.list()
        .then(res.resolve)
        .catch(res.reject)
};

module.exports = StatusTypesCtrl;
