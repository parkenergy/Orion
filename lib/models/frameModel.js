'use strict'

const mongoose = require('mongoose')

const frameModelSchema = new mongoose.Schema({
    model:        {type: String, required: true},
    netsuiteId:   {type: String, required: true, index: {unique: true}},
    isSynced:     {type: Boolean, default: false},
    activeStatus: {
        type:     Boolean,
        required: true,
        index:    true,
        default:  false
    },
    updated_at:   {type: Date},
})

frameModelSchema.pre('save', function (done) {
    this.updated_at = new Date()
    done()
})

//stamp updated_at on update
frameModelSchema.pre('update', function (done) {
    this.updated_at = new Date()
    done()
})

/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
frameModelSchema.virtual('created_at')
    .get(function () {
        return this.getCreateDate()
    })

require('../managers/frameModel')(frameModelSchema)

//Export model
module.exports = mongoose.model('FrameModels', frameModelSchema)
