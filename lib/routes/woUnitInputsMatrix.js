'use strict'

const router                 = require('express').Router(),
      WOunitInputsMatrixCtrl = require('../controllers/woUnitInputsMatrix')

router.route('/api/WOUnitInputsMatrix')
    .get(WOunitInputsMatrixCtrl.list)
    .post(WOunitInputsMatrixCtrl.create)

router.route('/api/WOUnitInputsMatrix/:id')
    .get(WOunitInputsMatrixCtrl.read)
    .put(WOunitInputsMatrixCtrl.update)

module.exports = (app) => {
    app.use(router)
}
