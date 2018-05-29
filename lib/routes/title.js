'use strict';

const router = require('express').Router();
const TitlesCtrl = require('../controllers/title');

router.route('/api/Titles')
    .get(TitlesCtrl.list);

module.exports = (app) => {
    app.use(router)
};
