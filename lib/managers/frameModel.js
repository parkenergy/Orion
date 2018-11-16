'use strict'

const ObjectId = require('mongoose').Types.ObjectId

module.exports = function (frameModelSchema) {

    /*** MODEL METHODS ***/

    //Create Document/s
    frameModelSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {
            const dataArr = [].concat(data) //Ensure data is an array, cast single
            this.insertMany(dataArr)
                .then(resolve)
                .catch(reject)
        })
    }

    //update single document
    frameModelSchema.statics.updateDoc = function (id, data) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //fetch by _id
    frameModelSchema.statics.fetch = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findById(id)
                .exec()
                .then(resolve)
                .catch(reject)

        })
    }

    frameModelSchema.statics.sync = function (options) {
        return new Promise((resolve, reject) => {
            const q = {}
            if (options.netsuiteId) {
                q.netsuiteId = {
                    $in: options.netsuiteId,
                }
            }
            this.find(q)
                .lean()
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //list documents
    frameModelSchema.statics.list = function (options) {
        return new Promise((resolve, reject) => {
            //query object
            const q = {}

            //date range filter
            if (options.from) {
                q.updated_at = {
                    $gte: options.from,
                    $lt:  options.to || new Date(),
                }
            }

            //sort string eg 'field' or '-field'
            const sort = options.sort || '-updated_at'

            //Pagenation
            const limit = options.limit || 50
            const skip = options.skip ? options.skip * limit : 0

            const cursor = this.find(q)

            if (options.skip) {
                cursor
                    .skip(skip)
                    .limit(limit)
            }
            //query model
            cursor
                .sort(sort)
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //Delete document
    frameModelSchema.statics.delete = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findOneAndRemove({id})
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

}
