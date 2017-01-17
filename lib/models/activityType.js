/**
 *            activityType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

const mongoose = require('mongoose');

// Construct Schema

const activityTypesSchema = new mongoose.Schema({
  activity: { type: String, required: true, index: true}
});

require('../managers/activityType')(activityTypesSchema);

// Export model
module.exports = mongoose.model('ActivityTypes', activityTypesSchema);
