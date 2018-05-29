'use strict';

const Title   = require('../models/title');

const TitlesCtrl = {};

/*
 * List all Activity Types
 * */

TitlesCtrl.list = (req, res) => {
    Title.list()
        .then(res.resolve)
        .catch(res.reject)
};

module.exports = TitlesCtrl;
