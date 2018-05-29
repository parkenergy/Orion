'use strict';

const ObjectId  = require('mongoose').Types.ObjectId;


module.exports = function (applicationTypeSchema) {

    /*** MODEL METHODS ***/

    //Create Document/s
    applicationTypeSchema.statics.createDoc = function (data) {

        const dataArr = [].concat(data) //Ensure data is an array, cast single object to array
        return new Promise((resolve, reject) => {
            this.insertMany(dataArr)
                .then(resolve)
                .catch(reject)
        })
    }

    //update single document
    applicationTypeSchema.statics.updateDoc = function (id, data) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //fetch by _id
    applicationTypeSchema.statics.fetch = function (id) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findById(id)
                .exec()
                .then(resolve)
                .catch(reject)

        })
    }

    applicationTypeSchema.statics.sync = function (options) {
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
    applicationTypeSchema.statics.list = function (options) {

        return new Promise((resolve, reject) => {
            //query object
            const q = {}

            //date range filter
            if (options.from) {
                q.updated_at = {
                    $gte: options.from,
                    $lt: options.to || new Date()
                }
            }

            //sort string eg 'field' or '-field'
            const sort = options.sort || '-updated_at'

            //Pagenation
            const size = options.size || 50
            const page = options.page ? options.page * size : 0

            //query model
            this.find(q)
                .skip(page)
                .limit(size)
                .sort(sort)
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //Delete document
    applicationTypeSchema.statics.delete = function (id) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findOneAndRemove({id})
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    /*** DOCUMENT METHODS ***/

    applicationTypeSchema.methods.getCreateDate = function () {
        return new Date(this._id.getTimestamp())
    }

};
