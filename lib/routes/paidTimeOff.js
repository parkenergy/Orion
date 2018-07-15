'use strict';

const router            = require('express').Router(),
    PaidTimeOffs = require('../controllers/paidTimeOff');

router.route('/api/PaidTimeOffs')
    .get(PaidTimeOffs.list)
    .post(PaidTimeOffs.create);

router.route('/api/PaidTimeOffs/:id')
    .get(PaidTimeOffs.read)
    .put(PaidTimeOffs.update)
    .delete(PaidTimeOffs.delete);

router.route('/api/PaidTimeOffs/client/:ptoId')
    .get(PaidTimeOffs.readPTO);

module.exports = (app) => {
    app.use(router);
};

