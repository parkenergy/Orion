'use strict';

const mongoose  = require('mongoose'),
    ObjectId = mongoose.Schema.ObjectId;

//Construct Schema
const editHistorySchema = new mongoose.Schema({
    user: {type: String, required: true},
    workOrder: {type: ObjectId, ref: 'WorkOrders', required: true, index: true},
    path: {type: Array, required: true},
    editType: {
        type: String,
        enum: ['Array', 'Edit', 'Add', 'Delete'],
        required: true
    },
    before: {type: mongoose.Schema.Types.Mixed, Default: null},
    after: {type: mongoose.Schema.Types.Mixed, Default: null},
    updated_at: {type: Date}
});


/* Validators
----------------------------------------------------------------------------- */


/* Hooks
----------------------------------------------------------------------------- */

//stamp updated_at on save
editHistorySchema.pre('save', function(done) {
    this.updated_at = new Date()
    done()
});

//stamp updated_at on update
editHistorySchema.pre('update', function(done) {
    this.updated_at = new Date()
    done()
});


/* Indices
----------------------------------------------------------------------------- */

//Index for sorting and querying by updated_at
editHistorySchema.index({updated_at: 1});


/* Virtual Fields
----------------------------------------------------------------------------- */

//Create virtual for created_at from _id creation timestamp
editHistorySchema.virtual('created_at')
    .get(function () {
        return this.getCreateDate()
    });

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/editHistory')(editHistorySchema);


//Export model
module.exports = mongoose.model('EditHistories', editHistorySchema);
