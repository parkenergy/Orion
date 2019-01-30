'use strict';
const PONumber   = require('../managers/poNumber');

const PONumberCtrl = {};

/*
 * List all Activity Types
 * */

PONumberCtrl.newPONumber = (req, res) => {
    PONumber.newPONumber()
            .then(res.resolve)
            .catch(res.reject);
};

PONumberCtrl.createPO = (req, res) => {
    PONumber.createPO(req.body)
            .then(res.resolve)
            .catch(res.reject);
};

module.exports = PONumberCtrl;
