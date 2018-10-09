'use strict'

const ObjectId = require('mongoose').Types.ObjectId

module.exports = function (woSOPTaskSchema) {

    /*** MODEL METHODS ***/

    //Create Document/s
    woSOPTaskSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {
            const dataArr = [].concat(data)
            this.insertMany(dataArr)
                .then(resolve)
                .catch(reject)
        })
    }

    //update single document
    woSOPTaskSchema.statics.updateDoc = function (id, data) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //fetch by _id
    woSOPTaskSchema.statics.fetch = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findById(id)
                .exec()
                .then(resolve)
                .catch(reject)

        })
    }

    //list documents
    woSOPTaskSchema.statics.list = function (options) {
        return new Promise((resolve, reject) => {

            //query model
            this.find(options)
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //Delete document
    /*woSOPTaskSchema.statics.delete = function (id) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findOneAndRemove({id})
                .exec()
                .then(resolve).catch(reject);
        });
    };*/

    /*** DOCUMENT METHODS ***/

    woSOPTaskSchema.methods.getCreateDate = function () {
        return new Date(this._id.getTimestamp())
    }

}
