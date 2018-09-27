'use strict'

const router         = require('express').Router(),
      FrameModelCtrl = require('../controllers/frameModel')

router.route('/api/FrameModels')
    .get(FrameModelCtrl.list)
    .post(FrameModelCtrl.create)

router.route('/api/FrameModels/ClientSync')
    .get(FrameModelCtrl.clientSync)

router.route('/api/FrameModels/:id')
    .get(FrameModelCtrl.read)
    .put(FrameModelCtrl.update)
    .delete(FrameModelCtrl.delete)

module.exports = (app) => {
    app.use(router)
}
