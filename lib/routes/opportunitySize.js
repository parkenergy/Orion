/**
 *            opportunitySize
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

const router = require('express').Router();
const OpportunitySize = require('../controllers/opportunitySize');

router.route('/api/OpportunitySizes')
.get(OpportunitySize.list);

module.exports = (app) => {
  app.use(router);
};
