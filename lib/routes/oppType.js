/**
 *            oppType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var router = require('express').Router();
var OppTypesCtrl = require('../controllers/oppType');

router.route('/api/OppTypes')
.get(OppTypesCtrl.list);

module.exports = function(app) {
  app.use(router);
};
