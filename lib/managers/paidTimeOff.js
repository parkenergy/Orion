'use strict';

const ObjectId    = require('mongoose').Types.ObjectId,
      _           = require('lodash'),
      ClientError = require('../errors/client');

const queryConstructor = (options, query) => {
    console.log(options);
    if (options.username) {
        query.username = options.username;
    }
    /*if(options.supervised.length > 0) {
        query.username = { $in: options.supervised };
    }*/
    if (options.type) {
        query.type = options.type;
    }
    if (options.from) {
        query.DateFrom = {
            $gte: options.from,
            $lte: options.to || new Date(),
        };
    }
    if (options.to) {
        query.DateTo = {
            $gte: options.from,
            $lte: options.to,
        };
    }
    query.status = {
        $in: _.chain(options.status)
                 .pickBy(v => v)
                 .keys()
                 .value(),
    };
    return {options, query};
};

module.exports = function(paidTimeOffSchema) {
    paidTimeOffSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {
            let dataArr = [].concat(data);
            if (!data) return reject(new ClientError('Missing document'));
            this.insertMany(dataArr)
                .then(resolve)
                .catch(reject);
        });
    };

    paidTimeOffSchema.statics.updateDoc = function (id, data) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    paidTimeOffSchema.statics.fetchPTO = function (ptoId) {
        return new Promise((resolve, reject) => {
            this.find({ptoId})
                .exec()
                .then((doc) => {
                    if (!doc) return {ptoId, exists: false};
                    if (doc.length === 0) return {ptoId, exists: false};
                    return doc;
                })
                .then(resolve)
                .catch(reject);
        });
    };

    paidTimeOffSchema.statics.fetch = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findById(id)
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    paidTimeOffSchema.statics.list = function (options) {
        return new Promise((resolve, reject) => {
            let q = {};
            const Q = queryConstructor(options, q);
            q = Q.query;
            const sort = options.sort || '-DateFrom';

            const size = options.size || 50;
            const page = options.page ? options.page * size : 0;

            if (options.role === 'manager' && options.supervised) {
                if (options.supervised.length > 0) {
                    q.username = {$in: [...options.supervised]};
                }
                this.find(q)
                    .skip(page)
                    .limit(size)
                    .sort(sort)
                    .exec()
                    .then(resolve)
                    .catch(reject);
            } else {
                this.find(q)
                    .skip(page)
                    .limit(size)
                    .sort(sort)
                    .exec()
                    .then(resolve)
                    .catch(reject);
            }
        });
    };

    paidTimeOffSchema.statics.delete = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findOneAndRemove({id})
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

};
