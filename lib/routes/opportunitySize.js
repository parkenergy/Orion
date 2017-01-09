/**
 *            opportunitySize
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var router = require('express').Router();
var OpportunitySize = require('../controllers/opportunitySize');

router.route('/api/OpportunitySizes')
.get(OpportunitySize.list);

module.exports = function(app) {
  app.use(router);
};
