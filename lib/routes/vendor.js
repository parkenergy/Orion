'use strict';

var router = require('express').Router();
var VendorCtrl = require('../controllers/vendor');

router.route('/api/Vendors')
  .get(VendorCtrl.list)
  .post(VendorCtrl.create);

router.route('/api/Vendors/:id')
  .get(VendorCtrl.read)
  .put(VendorCtrl.update)
  .delete(VendorCtrl.delete);

module.exports = function (app) {
  app.use(router);
};
