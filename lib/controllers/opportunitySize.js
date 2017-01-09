/**
 *            opportunitySize
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var OpportunitySize   = require('../models/opportunitySize');

var OpportunitySizesCtrl = {};

/*
 * List all Activity Types
 * */

OpportunitySizesCtrl.list = function (req, res) {
  OpportunitySize.list()
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = OpportunitySizesCtrl;
