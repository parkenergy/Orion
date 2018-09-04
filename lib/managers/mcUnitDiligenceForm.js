'use strict';

const ObjectId    = require('mongoose').Types.ObjectId,
      report      = require('../databaseScripts/mcUnitDiligenceReport'),
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

    mcUnitDiligenceFormSchema.statics.fetch = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);
            this.findById(id)
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
            if (options.from) {
                q.submitted = {
                    $gte: options.from,
                    $lte: options.to || new Date(),
                };
            }
            const limit = options.limit || null;
            const skip = options.skip ? options.skip + limit : 0

            this.find(q)
                .skip(skip)
                .limit(limit)
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    mcUnitDiligenceFormSchema.statics.mcUnitDiligenceFormsReport = function (options) {
        return new Promise((resolve, reject) => {
            let query = {};
            if (options.from && options.to) {
                query.submitted = {
                    $gte: options.from,
                    $lte: options.to || new Date(),
                };
            }
            report(this, query)
                .then(resolve)
                .catch(reject);
        });
    };
};
