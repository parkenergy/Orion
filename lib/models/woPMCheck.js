'use strict'

const mongoose     = require('mongoose'),
      autopopulate = require('mongoose-autopopulate'),
      ObjectId     = mongoose.Schema.ObjectId

/**
 * List of Tasks for WO PMS - used to autopopulate
 * another collection. woPMChecks
 */
const woPMCheckSchema = new mongoose.Schema({
    pmType:      {type: String, default: '1'},
    task:        {type: ObjectId, ref: 'WOSOPTasks', autopopulate: true},
    engines:     {type: [ObjectId], ref: 'EngineModels', autopopulate: true},
    compressors: {type: [ObjectId], ref: 'FrameModels', autopopulate: true},
})

woPMCheckSchema.plugin(autopopulate)

woPMCheckSchema.set('toJSON', {getters: true, virtuals: true})
woPMCheckSchema.set('toObject', {getters: true, virtuals: true})

require('../managers/woPMCheck')(woPMCheckSchema)

module.exports = mongoose.model('WOPMChecks', woPMCheckSchema)

