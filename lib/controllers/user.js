'use strict';

const User      = require('../models/user'),
    ClientError = require('../errors/client');

const UserCtrl = {};

/*
  Create User
    - Desc: takes single document or array of documents to insert
*/

UserCtrl.create = (req, res) => {
    if (!req.body) return res.reject(new ClientError('Missing body'));

    User.createDoc(req.body)
        .then(res.resolve).catch(res.reject);
};

/**
 * Query nsids for items to sync
 * @param req
 * @param res
 */
UserCtrl.clientSync = (req, res) => {
    const params = req.query;
    const options = {
        netsuiteId: params.netsuiteIds,
    };
    User.sync(options)
        .then(res.resolve).catch(res.reject);
};

/*
  List User
   - Desc: List documents per parameters provided
*/
UserCtrl.list = (req, res) => {
    const params = req.query;

    const options = {
        supervisor: params.supervisor || null,
        sort: params.sort || null,
        page: +params.page || null,
        size: +params.size || null,
        from: params.from || null,
        to: params.to || null,
        userName: params.userName || null,
        text: {
            username: params.textId || null,
        },
        regex: {
            fullName: params.regexName || null,
            area: params.regexArea || null
        }
    };

    User.list(options)
        .then(res.resolve).catch(res.reject);
};

/*
  Read User
   - Desc: Retrieve document by _id
 */
UserCtrl.read = (req, res) => {
    const {params: {id}, identity} = req;

    if (!id) return res.reject(new ClientError('Missing id parameter'));

    User.fetch(id, identity)
        .then(res.resolve).catch(res.reject);
};


/*
  Update User
   - Desc: Update single document or array
*/
UserCtrl.update = (req, res) => {
    const {params: {id}, body} = req;

    if (!body) return res.reject(new ClientError('Missing body'));
    if (!id) return res.reject(new ClientError('Missing id parameter'));

    User.updateDoc(id, body)
        .then(res.reject).catch(res.resolve);
};

/*
  Delete User
   - Desc: Delete single document or array of _id's
*/
UserCtrl.delete = (req, res) => {
    const id = req.params.id;

    if (!id) return res.reject(new ClientError('Missing id parameter'));

    User.delete(id)
        .then(res.resolve).catch(res.reject);
};


module.exports = UserCtrl;

/*** PRIVATE METHODS ***/
/*const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;*/
/*const validateEmail = (email) => {
  return emailPattern.test(email);
};*/
