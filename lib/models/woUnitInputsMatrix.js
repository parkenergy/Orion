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
    /*
    * one of accounts for the number of inputs under one label name
    * */
    one:         {type: Number, required: true, default: 0}, // # in list of inner input
    of:          {type: Number, required: true, default: 0}, // of 3 or something like that
    panel:       {type: String, default: 'unitReadings'}, // which panel does it go under otherwise
                                                          // unitReadings
    /*
    * - order accounts for groups of inputs with a single input but in a
    * group like cylinder 1 - 16, they need to be listed in order
    * - orderType is the string to set which items should be in order
    * - if '' then order is not checked on front end.
    * - else check for the order and sort based on that.
    * */
    orderType: {type: String, required: true, default: ''}, // order of many inputs with name
    order:     {type: Number, required: true, default: 0}, // # in that ordering
    pmType:    {type: String, default: ''}, // needed for inputs to show or not

    name:        {type: String, required: true}, // identifier
    type:        {type: String, required: true}, // electron type
    path:        {type: String, required: true}, // path to value in obj
    placeholder: {type: String, required: true, default: ''},
    min:         {type: mongoose.Schema.Types.Mixed}, // for numbers only
    max:         {type: mongoose.Schema.Types.Mixed}, // for numbers only
    engines:     {type: Array},
    compressors: {type: Array},
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
