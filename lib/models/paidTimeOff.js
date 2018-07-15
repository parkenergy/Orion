'use strict';

const mongoose = require('mongoose'),
    autopopulate = require('mongoose-autopopulate'),
    ObjectId = mongoose.Schema.ObjectId;

const paidTimeOffSchema = new mongoose.Schema({
    ptoId:    {type: String, index: true},
    DateTo:   {type: Date, index: true},
    DateFrom: {type: Date, index: true},

    ptoDays: [{
        dateOf: {type: Date},
        hours:  {type: Number},
    }],

    hours:          {type: Number},
    type:           {type: String, enum: ['Vacation', 'Sick Leave']},
    comment:        {type: String},
    reviewedBy:     {type: String},
    userId:         {type: ObjectId, ref: 'Users'},
    username:       {type: String, index: true},
    created:        {type: Date},
    timeReviewed:   {type: Date},
    managerComment: {type: String, default: ''},

    status: {type: String, enum: ['Pending', 'Approved', 'Rejected']},
    done:   {type: Boolean, required: true},
    exists: {type: Boolean, required: true},

    updated_at: {type: Date},
});

paidTimeOffSchema.plugin(autopopulate);

function updated_at (next) {
    this.updated_at = new Date();
    next();
}

/* Hooks
----------------------------------------------------------------------------- */
paidTimeOffSchema.pre('save', updated_at);

paidTimeOffSchema.pre('update', updated_at);

paidTimeOffSchema.pre('findOneAndUpdate', function (next) {
    if (this._update.status === 'Rejected' ||
        this._update.status === 'Approved') this._update.done = true;

    next();
});



/* Indices
----------------------------------------------------------------------------- */
paidTimeOffSchema.index({
    DateTo: 1,
    DateFrom: 1,
});

/* Virtual Fields
----------------------------------------------------------------------------- */

/* Manager
 ----------------------------------------------------------------------------- */

require('../managers/paidTimeOff')(paidTimeOffSchema);


//Export model
module.exports = mongoose.model('PaidTimeOffs', paidTimeOffSchema);
