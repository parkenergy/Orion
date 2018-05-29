'use strict';

const router = require('express').Router(),
    UserCtrl = require('../controllers/user');

router.route('/api/Users')
    .get(UserCtrl.list)
    .post(UserCtrl.create);

router.route('/api/Users/ClientSync')
    .get(UserCtrl.clientSync);

router.route('/api/Users/:id')
    .get(UserCtrl.read)
    .put(UserCtrl.update)
    .delete(UserCtrl.delete);

module.exports = (app) => {
    app.use(router)
};
