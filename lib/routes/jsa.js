'use strict';

var router = require('express').Router();
var JsaCtrl = require('../controllers/jsa');

router.route('/api/Jsas')
  .get(JsaCtrl.list)
  .post(JsaCtrl.create);

router.route('/api/Jsas/:id')
  .get(JsaCtrl.read)
  .put(JsaCtrl.update)
  .delete(JsaCtrl.delete);

module.exports = function(app) {
  app.use(router);
};
