'use strict'
const ObjectId = require('mongoose').Types.ObjectId

module.exports = function (killCodeSchema) {
    killCodeSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {
            const dataArr = [].concat(data)
            this.insertMany(dataArr)
                .then(resolve)
                .catch(reject)
        })
    }

    killCodeSchema.statics.updateDoc = function (id, data) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findByIdAndUpdate(id, data, {
                safe: false,
                new:  true
            })
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    killCodeSchema.statics.fetch = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findById(id)
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    killCodeSchema.statics.sync = function (options) {
        return new Promise((resolve, reject) => {
            const q = {}
            if (options.netsuiteId) {
                q.netsuiteId = {
                    $in: options.netsuiteId
                }
            }
            this.find(q)
                .lean()
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    killCodeSchema.statics.list = function (options) {
        return new Promise((resolve, reject) => {
            const q = {}

            if (options.from) {
                q.updated_at = {
                    $gte: options.from,
                    $lt:  options.to || new Date()
                }
            }

            const sort = options.sort || '-updated_at'

            const limit = options.limit || 100
            const skip = options.skip ? options.skip * limit : 0

            this.find(q)
                .skip(skip)
                .limit(limit)
                .sort(sort)
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    killCodeSchema.statics.delete = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findOneAndRemove({id})
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }
}
