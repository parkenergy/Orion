/**
 *            title
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var router = require('express').Router();
var TitlesCtrl = require('../controllers/title');

router.route('/api/Titles')
.get(TitlesCtrl.list);

module.exports = function(app) {
  app.use(router);
};
