'use strict'

const mongoose = require('mongoose')

const killCodeSchema = new mongoose.Schema({
    label:        {
        type:     String,
        required: true,
        index:    true
    },
    netsuiteId:   {
        type:     Number,
        required: true,
        index:    {unique: true}
    },
    activeStatus: {
        type:     Boolean,
        required: true,
        index:    true,
        default:  false
    },
    updated_at:   {type: Date}
})

killCodeSchema.pre('save', function (done) {
    this.updated_at = new Date()
    done()
})

killCodeSchema.pre('update', function (done) {
    this.updated_at = new Date()
    done()
})

killCodeSchema.index({
    update_at:  1,
    netsuiteId: 1,
    label:      1
})

killCodeSchema.virtual('created_at')
              .get(() => {
                  return this.getCreateDate()
              })

require('../managers/killCode')(killCodeSchema)

module.exports = mongoose.model('KillCodes', killCodeSchema)
