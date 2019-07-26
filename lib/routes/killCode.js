'use strict'

const router = require('express').Router()
const KillCodeCtrl = require('../controllers/killCode')

router.route('/api/KillCodes')
      .get(KillCodeCtrl.list)
      .post(KillCodeCtrl.create)

router.route('/api/KillCodes/ClientSync')
      .get(KillCodeCtrl.clientSync)

router.route('/api/KillCodes/:id')
      .get(KillCodeCtrl.read)
      .put(KillCodeCtrl.update)
      .delete(KillCodeCtrl.delete)

module.exports = (app) => {
    app.use(router)
}
