'use strict'

const ObjectId = require('mongoose').Types.ObjectId

module.exports = function (woPMCheckSchema) {

    /*** MODEL METHODS ***/

    //Create Document/s
    woPMCheckSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {
            const dataArr = [].concat(data)
            this.insertMany(dataArr)
                .then(resolve)
                .catch(reject)
        })
    }

    //update single document
    woPMCheckSchema.statics.updateDoc = function (id, data) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //fetch by _id
    woPMCheckSchema.statics.fetch = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findById(id)
                .exec()
                .then(resolve)
                .catch(reject)

        })
    }

    //list documents
    woPMCheckSchema.statics.list = function (options) {
        return new Promise((resolve, reject) => {

            //query model
            this.find(options)
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //Delete document
    /*woPMCheckSchema.statics.delete = function (id) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findOneAndRemove({id})
                .exec()
                .then(resolve).catch(reject);
        });
    };*/

    /*** DOCUMENT METHODS ***/

    woPMCheckSchema.methods.getCreateDate = function () {
        return new Date(this._id.getTimestamp())
    }

}
