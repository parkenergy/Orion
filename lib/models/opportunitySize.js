/**
 *            opportunitySize
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

const mongoose = require('mongoose');

// Construct Schema

const opportunitySizesSchema = new mongoose.Schema({
  size: { type: String, required: true, index: true}
});

require('../managers/opportunitySize')(opportunitySizesSchema);

// Export model
module.exports = mongoose.model('OpportunitySizes', opportunitySizesSchema);
