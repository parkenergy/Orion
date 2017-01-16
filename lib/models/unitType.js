/**
 *            unitType
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

var unitTypesSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true}
});

require('../managers/unitType')(unitTypesSchema);

// Export model
module.exports = mongoose.model('UnitTypes', unitTypesSchema);
