/**
 *            title
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

var titlesSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true}
});

require('../managers/title')(titlesSchema);

// Export model
module.exports = mongoose.model('Titles', titlesSchema);

