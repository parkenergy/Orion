'use strict';

const OppType   = require('../models/oppType');

const OppTypesCtrl = {};

/*
 * List all Activity Types
 * */

OppTypesCtrl.list = (req, res) => {
    OppType.list()
        .then(res.resolve)
        .catch(res.reject)
};

module.exports = OppTypesCtrl;
