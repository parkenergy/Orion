/**
 *            callReport
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var router = require('express').Router();
var CallReportCtrl = require('../controllers/callReport');

router.route('/api/CallReports')
.get(CallReportCtrl.list)
.post(CallReportCtrl.create);

router.route('/api/CallReports/:id')
.get(CallReportCtrl.read)
.put(CallReportCtrl.update)
.delete(CallReportCtrl.delete);

module.exports = function(app) {
  app.use(router);
};
