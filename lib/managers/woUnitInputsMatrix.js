'use strict'

const ObjectId = require('mongoose').Types.ObjectId
const FrameModel = require('../models/frameModel')
const EngineModel = require('../models/engineModel')

const populateEngineModels = (obj) => {
    return new Promise((resolve, reject) => {
        if (obj.engines.length === 0) {
            return resolve(obj)
        } else {
            obj.toObject()
            EngineModel.find({netsuiteId: {$in: obj.engines}})
                       .exec()
                       .then((res) => {
                           obj.engines = res
                           return obj
                       })
                       .then(resolve)
                       .catch(reject)

        }
    })
}

const populateFrameModels = (obj) => {
    return new Promise((resolve, reject) => {
        if (obj.compressors.length === 0) {
            return resolve(obj)
        } else {
            obj.toObject()
            FrameModel.find({netsuiteId: {$in: obj.compressors}})
                      .exec()
                      .then((res) => {
                          obj.compressors = res.map((r) => r.toObject())
                          return obj
                      })
                      .then(resolve)
                      .catch(reject)
        }
    })
}

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

            this.findById(id)
                .exec()
                .then(resolve)
                .catch(reject)

        })
    }

    //list documents
    woUnitInputsMatrixSchema.statics.list = function (options) {
        return new Promise((resolve, reject) => {

            //query model
            this.find(options)
                .exec()
                .then((res) => Promise.all(res.map(populateEngineModels)))
                .then((res) => Promise.all(res.map(populateFrameModels)))
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
