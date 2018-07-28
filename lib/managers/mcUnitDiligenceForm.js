'use strict';

const ObjectId    = require('mongoose').Types.ObjectId,
      ClientError = require('../errors/client');

module.exports = function (mcUnitDiligenceFormSchema) {
    mcUnitDiligenceFormSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {
            let dataArr = [].concat(data);
            if (!data) return reject(new ClientError('Missing documents'));
            this.insertMany(dataArr)
                .then(resolve)
                .catch(reject);
        });
    };

    mcUnitDiligenceFormSchema.statics.updateDoc = function (id, data) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    mcUnitDiligenceFormSchema.statics.fetch = function (unitNumber) {
        return new Promise((resolve, reject) => {
            this.findOne({unitNumber})
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    mcUnitDiligenceFormSchema.statics.list = function (options) {
        return new Promise((resolve, reject) => {
            let q = {};
            if (options.unitNumber) {
                q.unitNumber = options.unitNumber;
            }
            const limit = options.limit || null;
            const skip = options.skip ? options.skip * limit : 0;

            this.find(q)
                .skip(skip)
                .limit(limit)
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };
};
