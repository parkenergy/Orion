'use strict'

const ObjectId = require('mongoose').Types.ObjectId

module.exports = function (woUnitInputsMatrixSchema) {

    /*** MODEL METHODS ***/

    //Create Document/s
    woUnitInputsMatrixSchema.statics.createDoc = function (data) {
        return new Promise((resolve, reject) => {
            const dataArr = [].concat(data)
            this.insertMany(dataArr)
                .then(resolve)
                .catch(reject)
        })
    }

    //update single document
    woUnitInputsMatrixSchema.statics.updateDoc = function (id, data) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //fetch by _id
    woUnitInputsMatrixSchema.statics.fetch = function (id) {
        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id)

            console.log(id)
            console.log(typeof id)
            console.log(id.valueOf())
            this.findById(id)
                .exec()
                .then((res) => {
                    console.log('this is res')
                    console.log(res)
                    resolve(res)
                })
                .catch(reject)

        })
    }

    //list documents
    woUnitInputsMatrixSchema.statics.list = function (options) {
        return new Promise((resolve, reject) => {

            //query model
            this.find(options)
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

    //Delete document
    /*woUnitInputsMatrixSchema.statics.delete = function (id) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findOneAndRemove({id})
                .exec()
                .then(resolve).catch(reject);
        });
    };*/

    /*** DOCUMENT METHODS ***/

    woUnitInputsMatrixSchema.methods.getCreateDate = function () {
        return new Date(this._id.getTimestamp())
    }

}
