'use strict';

const router = require('express').Router(),
  ReviewNoteCtrl = require('../controllers/reviewNote');

router.route('/api/ReviewNotes')
  .get(ReviewNoteCtrl.list)
  .post(ReviewNoteCtrl.create);

router.route('/api/ReviewNotes/:id')
  .get(ReviewNoteCtrl.read)
  .put(ReviewNoteCtrl.update)
  .delete(ReviewNoteCtrl.delete);

module.exports = (app) => {
  app.use(router);
};
