/**
 *            oppType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
// 'use strict';

const mongoose = require('mongoose');

// Construct Schema

const oppTypesSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true}
});

require('../managers/oppType')(oppTypesSchema);

// Export model
module.exports = mongoose.model('OppTypes', oppTypesSchema);
