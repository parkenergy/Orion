'use strict';

const OpportunitySize   = require('../models/opportunitySize');

const OpportunitySizesCtrl = {};

/*
 * List all Activity Types
 * */

OpportunitySizesCtrl.list = (req, res) => {
    OpportunitySize.list()
        .then(res.resolve)
        .catch(res.reject)
};

module.exports = OpportunitySizesCtrl;
