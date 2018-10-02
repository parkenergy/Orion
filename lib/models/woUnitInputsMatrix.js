'use strict'

const mongoose     = require('mongoose'),
      autopopulate = require('mongoose-autopopulate'),
      ObjectId     = mongoose.Schema.ObjectId

/**
 * Special Schema for objet used to populate inputs on
 * the WorkOrder system for clients.
 *
 * Edits to Schema should only be made with regard for their
 * affects to the electron application and its stability
 */
const woUnitInputsMatrixSchema = new mongoose.Schema({
    label:       {type: String, required: true}, // label of group if group
    name:        {type: String, required: true}, // identifier
    type:        {type: String, required: true}, // electron type
    path:        {type: String, required: true}, // path to value in obj
    placeholder: {type: String, required: true, default: ''},
    min:         {type: mongoose.Schema.Types.Mixed}, // for numbers only
    max:         {type: mongoose.Schema.Types.Mixed}, // for numbers only
    engines:     {type: [ObjectId], ref: 'EngineModels', autopopulate: true},
    compressors: {type: [ObjectId], ref: 'FrameModels', autopopulate: true},
    /*
    *
    * value:    filled on electron
    * onChange: filled on electron
    * disabled: filled on electron
    *
    * */
})

woUnitInputsMatrixSchema.plugin(autopopulate)

woUnitInputsMatrixSchema.set('toJSON', {getters: true, virtuals: true})
woUnitInputsMatrixSchema.set('toObject', {getters: true, virtuals: true})

require('../managers/woUnitInputsMatrix')(woUnitInputsMatrixSchema)

module.exports = mongoose.model('WOUnitInputsMatrix', woUnitInputsMatrixSchema)
