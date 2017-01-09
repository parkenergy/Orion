/**
 *            activityType
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

var activityTypesSchema = new mongoose.Schema({
  activity: { type: String, required: true, index: true}
});

require('../managers/activityType')(activityTypesSchema);

// Export model
module.exports = mongoose.model('ActivityTypes', activityTypesSchema);
