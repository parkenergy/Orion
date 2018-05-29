'use strict';

const router             = require('express').Router(),
    SyncDataCtrl = require('../controllers/syncData');

router.route('/api/SyncDatas')
    .get(SyncDataCtrl.list)
    .post(SyncDataCtrl.create);

router.route('/api/SyncDatas/:id')
    .get(SyncDataCtrl.read)
    .put(SyncDataCtrl.update)
    .delete(SyncDataCtrl.delete);

module.exports = (app) => {
    app.use(router)
};
