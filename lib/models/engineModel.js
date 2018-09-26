'use strict'

const mongoose = require('mongoose')

const engineModelSchema = new mongoose.Schema({
    model:      {type: String, required: true},
    netsuiteId: {type: String, required: true, index: {unique: true}},
    inSynced:   {type: Boolean, default: false},
    updated_at: {type: Date},
})

engineModelSchema.pre('save', function (done) {
    this.updated_at = new Date()
    done()
})

//stamp updated_at on update
engineModelSchema.pre('update', function (done) {
    this.updated_at = new Date()
    done()
})

require('../managers/engineModel')(engineModelSchema)

//Export model
module.exports = mongoose.model('EngineModels', engineModelSchema)
