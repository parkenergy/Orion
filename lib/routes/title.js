/**
 *            title
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

const router = require('express').Router();
const TitlesCtrl = require('../controllers/title');

router.route('/api/Titles')
.get(TitlesCtrl.list);

module.exports = (app) => {
  app.use(router);
};
