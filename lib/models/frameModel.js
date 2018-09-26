'use strict'

const mongoose = require('mongoose')

const frameModelSchema = new mongoose.Schema({
    model:      {type: String, required: true},
    netsuiteId: {type: String, required: true, index: {unique: true}},
    inSynced:   {type: Boolean, default: false},
    updated_at: {type: Date},
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

require('../managers/frameModel')(frameModelSchema)

//Export model
module.exports = mongoose.model('FrameModels', frameModelSchema)
