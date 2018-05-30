'use strict';

const ObjectId = require('mongoose').Types.ObjectId,
    ClientError   = require('../errors/client');

const queryConstructor = (options, query) => {
    console.log(options);
    if (options.username) {
        query.username = options.username;
    }
    if (options.type) {
        query.type = options.type;
    }
    if (options.DateFrom) {
        query.DateFrom = {
            $gte: options.from,
            $lte: options.to,
        };
    }
    if (options.DateTo) {
        query.DateTo = {
            $gte: options.from,
            $lte: options.to,
        };
    }
    if ((options.approved || options.rejected) && !options.adminReviewed) {
        // check not admin approved and is either approved or rejected
        query.$and = [];

        if (options.approved && options.rejected) {
            query.$and.push({$or: [{approved: true}, {rejected: true}]});
        } else if (options.approved && !options.rejected) {
            query.$and.push({approved: true});
        } else {
            query.$and.push({rejected: true});
        }
        query.$and.push({adminReviewed: false});

    } else if ((options.approved || options.rejected) && options.adminReviewed) {
        // check if admin reviewed and if approved or rejected
        if (options.approved && options.rejected) {
            query.$or = [
                {approved: true},
                {rejected: true},
                {adminReviewed: true}];
        } else if (options.approved && !options.rejected) {
            query.$and = [];
            query.$and.push({approved: true});
            query.$and.push({adminReviewed: true});
        } else {
            query.$and = [];
            query.$and.push({rejected: true});
            query.$and.push({adminReviewed: true});
        }
    } else if ((!options.approved && !options.rejected) && options.adminReviewed) {
        // only check if admin reviewed
        query.adminReviewed = true;
    } else if ((!options.approved && !options.rejected) && !options.adminReviewed) {
        // get for managers. Means not approvedBy anyone
        query.$and = [{adminReviewed: false}, {approvedBy: ''}];
    }
    return {options, query};
};

module.exports = function(paidTimeOffSchema) {
    paidTimeOffSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {
            let dataArr = [].concat(data);
            if (!data) return reject(new ClientError('Missing document'));
            this.insertMany(dataArr)
                .then(resolve).catch(reject);
        });
    };

    paidTimeOffSchema.statics.updateDoc = function (id, data) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve).catch(reject);
        });
    };

    paidTimeOffSchema.statics.fetch = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findById(id)
                .exec()
                .then(resolve).catch(reject);
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
                q.username = {$in: [...options.supervised]};
                this.find(q)
                    .skip(page)
                    .limit(size)
                    .sort(sort)
                    .exec()
                    .then(resolve).catch(reject);
            } else {
                this.find(q)
                    .skip(page)
                    .limit(size)
                    .sort(sort)
                    .exec()
                    .then(resolve).catch(reject);
            }
        });
    };

    paidTimeOffSchema.statics.delete = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findOneAndRemove({id})
                .exec()
                .then(resolve).catch(reject);
        });
    };

};
