'use strict'

const mongoose     = require('mongoose'),
      autopopulate = require('mongoose-autopopulate')

/**
 * List of Tasks for WO PMS - used to autopopulate
 * another collection. woPMChecks
 */
const woSOPTaskSchema = new mongoose.Schema({
    taskNumber: {type: Number, required: true, unique: true},
    text:       {type: String, required: true, unique: true},
})

woSOPTaskSchema.plugin(autopopulate)

woSOPTaskSchema.set('toJSON', {getters: true, virtuals: true})
woSOPTaskSchema.set('toObject', {getters: true, virtuals: true})

require('../managers/woSOPTask')(woSOPTaskSchema)

module.exports = mongoose.model('WOSOPTasks', woSOPTaskSchema)
