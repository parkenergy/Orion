/**
 *            statusType
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

var statusTypesSchema = new mongoose.Schema({
  status: { type: String, required: true, index: true}
});

require('../managers/statusType')(statusTypesSchema);

// Export model
module.exports = mongoose.model('StatusTypes', statusTypesSchema);