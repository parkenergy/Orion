/**
 *            title
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var Title   = require('../models/title');

var TitlesCtrl = {};

/*
 * List all Activity Types
 * */

TitlesCtrl.list = function (req, res) {
  Title.list()
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = TitlesCtrl;
