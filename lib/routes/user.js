'use strict';

var router = require('express').Router();
var UserCtrl = require('../controllers/user');

router.route('/api/Users')
  .get(UserCtrl.list)
  .post(UserCtrl.create);

router.route('/api/Users/:id')
  .get(UserCtrl.read)
  .put(UserCtrl.update)
  .delete(UserCtrl.delete);

module.exports = function(app) {
  app.use(router);
};
