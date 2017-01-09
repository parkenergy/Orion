/**
 *            oppType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var OppType   = require('../models/oppType');

var OppTypesCtrl = {};

/*
 * List all Activity Types
 * */

OppTypesCtrl.list = function (req, res) {
  OppType.list()
    .then(res.resolve)
    .catch(res.reject);
};

module.exports = OppTypesCtrl;
