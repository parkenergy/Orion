/**
 *            opportunitySize
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
// 'use strict';

const OpportunitySize   = require('../models/opportunitySize');

const OpportunitySizesCtrl = {};

/*
 * List all Activity Types
 * */

OpportunitySizesCtrl.list = (req, res) => {
  OpportunitySize.list()
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = OpportunitySizesCtrl;
