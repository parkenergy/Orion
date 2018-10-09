'use strict'

const router        = require('express')
    .Router(),
      woSOPTaskCtrl = require('../controllers/woSOPTask')

router.route('/api/WOSOPTask')
      .get(woSOPTaskCtrl.list)
      .post(woSOPTaskCtrl.create)

router.route('/api/WOSOPTask/:id')
      .get(woSOPTaskCtrl.read)
      .put(woSOPTaskCtrl.update)

module.exports = (app) => {
    app.use(router)
}
