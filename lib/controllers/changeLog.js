'use strict';

const ChangeLog = require('../models/changeLog'),
    ClientError = require('../errors/client');

const ChangeLogCtrl = {
  create(req, res) {
    if (!req.body) return res.reject(new ClientError('Missing Body Change Log'));

    ChangeLog.createDoc(req.body)
      .then(res.resolve)
      .catch(res.reject);
  },

  list(req, res) {
    const params = req.query;
    const Options = {
      sort: params.sort || null,
      skip: +params.skip || null,
      limit: +params.limit || null,
      from: params.from || null,
      to: params.to || null,
      name: params.name || '',
    };
    ChangeLog.list(Options)
      .then(res.resolve)
      .catch(res.reject);
  },

  read(req, res) {
    const id = req.params.id;
    if (!id) return res.reject(new ClientError('Missing Id parameter for ChangeLog'));

    ChangeLog.fetch(id)
      .then(res.resolve)
      .catch(res.reject);
  },

  update(req, res) {
    const { body, params: {id} } = req;

    if(!body) return res.reject(new ClientError("Missing body for changeLoc"));
    if(!id) return res.reject(new ClientError("Missing id parameter for changeLog"));

    ChangeLog.updateDoc(id, body)
      .then(res.resolve)
      .catch(res.reject);
  },

  delete(req, res) {
    const id = req.params.id;
    if(!id) return res.reject(new ClientError("Missing id parameter for changeLog"));

    ChangeLog.delete(id)
      .then(res.resolve)
      .catch(res.reject);
  }
};

module.exports = ChangeLogCtrl;
