'use strict';

const router    = require('express').Router(),
    WorkOrderCtrl = require('../controllers/workOrder');

router.route('/api/WorkOrders')
    .get(WorkOrderCtrl.list)
    .post(WorkOrderCtrl.create);

router.route('/api/WorkOrdersCount')
    .get(WorkOrderCtrl.authCount);

router.route('/api/WorkOrderPayrollDump')
    .get(WorkOrderCtrl.payrollDump);

router.route('/api/WorkOrderDump')
    .get(WorkOrderCtrl.woDump);

router.route('/api/WorkorderPartDump')
    .get(WorkOrderCtrl.woPartDump);

router.route('/api/WorkOrdersNoIdentityCount')
    .get(WorkOrderCtrl.noAuthCount);

router.route('/api/WorkOrdersUnapprovedArea')
    .get(WorkOrderCtrl.unapprovedByAreaM);

router.route('/api/WorkOrders/:id')
    .get(WorkOrderCtrl.read)
    .put(WorkOrderCtrl.update)
    .delete(WorkOrderCtrl.delete);

module.exports = (app) => {
    app.use(router)
};
