'use strict';

var router = require('express').Router();
var ReviewNoteCtrl = require('../controllers/reviewNote');

router.route('/api/ReviewNotes')
  .get(ReviewNoteCtrl.list)
  .post(ReviewNoteCtrl.create);

router.route('/api/ReviewNotes/:id')
  .get(ReviewNoteCtrl.read)
  .put(ReviewNoteCtrl.update)
  .delete(ReviewNoteCtrl.delete);

module.exports = function(app) {
  app.use(router);
};