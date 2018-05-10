/**
 *            oppType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
// 'use strict';

const router = require('express').Router();
const OppTypesCtrl = require('../controllers/oppType');

router.route('/api/OppTypes')
.get(OppTypesCtrl.list);

module.exports = (app) => {
  app.use(router);
};
