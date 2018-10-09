'use strict'

const router        = require('express')
    .Router(),
      woPMCheckCtrl = require('../controllers/woPMCheck')

router.route('/api/WOSOPTask')
      .get(woPMCheckCtrl.list)
      .post(woPMCheckCtrl.create)

router.route('/api/WOSOPTask/:id')
      .get(woPMCheckCtrl.read)
      .put(woPMCheckCtrl.update)

module.exports = (app) => {
    app.use(router)
}
