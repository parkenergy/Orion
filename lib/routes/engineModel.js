'use strict'

const router          = require('express').Router(),
      EngineModelCtrl = require('../controllers/engineModel')

router.route('/api/EngineModels')
    .get(EngineModelCtrl.list)
    .post(EngineModelCtrl.create)

router.route('/api/EngineModels/ClientSync')
    .get(EngineModelCtrl.clientSync)

router.route('/api/EngineModels/:id')
    .get(EngineModelCtrl.read)
    .put(EngineModelCtrl.update)
    .delete(EngineModelCtrl.delete)

module.exports = (app) => {
    app.use(router)
}
