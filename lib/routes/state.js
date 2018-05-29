'use strict';

const router = require('express').Router(),
    StateCtrl = require('../controllers/state');

router.route('/api/States')
    .get(StateCtrl.list)
    .post(StateCtrl.create);

router.route('/api/States/ClientSync')
    .get(StateCtrl.clientSync);

router.route('/api/States/:id')
    .get(StateCtrl.read)
    .put(StateCtrl.update)
    .delete(StateCtrl.delete);

module.exports = (app) => {
    app.use(router)
};
