/**
 *            opportunitySize
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var mongoose = require('mongoose'),
    _        = require('lodash'),
    ObjectId = mongoose.Schema.ObjectId;

// Construct Schema

var opportunitySizesSchema = new mongoose.Schema({
  size: { type: String, required: true, index: true}
});

require('../managers/opportunitySize')(opportunitySizesSchema);

// Export model
module.exports = mongoose.model('OpportunitySizes', opportunitySizesSchema);
