/**
 *            title
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

const Title   = require('../models/title');

const TitlesCtrl = {};

/*
 * List all Activity Types
 * */

TitlesCtrl.list = function (req, res) {
  Title.list()
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = TitlesCtrl;
