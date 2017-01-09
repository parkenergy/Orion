/**
 *            oppType
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

var oppTypesSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true}
});

require('../managers/oppType')(oppTypesSchema);

// Export model
module.exports = mongoose.model('OppTypes', oppTypesSchema);
