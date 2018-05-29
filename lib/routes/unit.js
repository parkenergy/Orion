'use strict';

const router = require('express').Router(),
    UnitCtrl = require('../controllers/unit');

router.route('/api/Units')
    .get(UnitCtrl.list)
    .post(UnitCtrl.create);

router.route('/api/Units/ClientSync')
    .get(UnitCtrl.clientSync);

router.route('/api/Units/:id')
    .get(UnitCtrl.read)
    .put(UnitCtrl.update)
    .delete(UnitCtrl.delete);

router.route('/api/Unit/Workorders')
    .get(UnitCtrl.listWorkOrders);

router.route('/api/UnitNoIdentityCount')
    .get(UnitCtrl.noAuthCount);

module.exports = (app) => {
    app.use(router)
};
