'use strict';

const PartOrder = require('../models/partOrder'),
    log = require('../helpers/logger'),
    User = require('../models/user'),
    ClientError = require('../errors/client'),
    AuthError = require('../errors/auth');

const PartOrderCtrl = {};

/*
  Create PartOrder
    - Desc: takes single document or array of documents to insert
*/

PartOrderCtrl.create = (req, res) => {
    if (!req.body) return res.reject(new ClientError('Missing body'));

    PartOrder.createDoc(req.body)
        .then(res.resolve).catch(res.reject);
};

/*
  List PartOrder
   - Desc: List documents per parameters provided
*/
PartOrderCtrl.list = (req, res) => {
    const {query: params, identity} = req;
    if (!identity) return res.reject(new AuthError('Not authenticated'));

    const options = {
        sort: params.sort || '-timeSubmitted',
        size: +params.size || null,
        page: +params.page || null,
        report: params.report || null,
        techId: params.techId || null,
        ids: params.ids || null,
        destinationID: params.destination || null,
        supervised: [],
        //status filters
        status: {
            pending: params.pending || false,
            backorder: params.backorder || false,
            ordered: params.ordered || false,
            completed: params.completed || false,
            canceled: params.canceled || false
        }
    };

    try {
        if (params.from) {
            options.from = new Date(decodeURIComponent(params.from));
        }
        if (params.to) {
            options.to = new Date(decodeURIComponent(params.to));
        }

        if (identity.role === 'manager') {
            User.getTechsForSupervisor(identity.username)
                .then(techs => {
                if (!techs) techs = [];

                    // Add current user as well.
                techs.push(identity.username);
                options.supervised = techs;

                return PartOrder.list(options);
                })
                .then(res.resolve).catch(res.reject);
        }
        else if (identity.role === 'admin') {
            PartOrder.list(options)
                .then(result => {
                    if (options.report) {
                        res.downloadable('PartsReport.csv', 'text/csv', result);
                    } else {
                        res.resolve(result);
                    }
                }).catch(res.reject);
        }
        else return res.reject(new AuthError(
                'You do not have the privileges to access this resource'));
    }
    catch (e) {
        log.warn('Failed to parse params into date');
        res.reject(e);
    }
};

PartOrderCtrl.readForm = (req, res) => {
    const {params: {id, poFormID}} = req;
    if (!id) return res.reject(new ClientError('Missing id parameter'));

    PartOrder.fetchForm(id, poFormID)
        .then(res.resolve).catch(res.reject);
};

/*
  Read PartOrder
   - Desc: Retrieve document by orderId
*/
PartOrderCtrl.read = (req, res) => {
    const {params: {id}} = req;

    // THE CLIENT NEEDS TO REQUEST AND THEY CAN'T AUTH
    /*const identity = req.identity;

    log.trace({identity: identity}, "User identity");

    if(!identity) return res.reject(new AuthError("Not authenticated"));
    if(identity.role !== 'admin' && identity.role !== 'manager') return res.reject(new AuthError("Not Authorized"));*/
    if (!id) return res.reject(new ClientError('Missing id parameter'));

    PartOrder.fetch(id)
        .then(res.resolve).catch(res.reject);
};

/*
  Update PartOrder
   - Desc: Update single document or array
*/
PartOrderCtrl.update = (req, res) => {
    const {body, params: {id}} = req;

    if (!body) return res.reject(new ClientError('Missing body'));
    if (!id) return res.reject(new ClientError('Missing id parameter'));

    PartOrder.updateDoc(id, body)
        .then(res.resolve).catch(res.reject);

};

/*
  Delete PartOrder
   - Desc: Delete single document or array of _id's
*/
PartOrderCtrl.delete = (req, res) => {
    res.reject(new ClientError(
        'Not allowed to delete Part Order, set to Canceled or contact Administrator.'));
};

module.exports = PartOrderCtrl;
