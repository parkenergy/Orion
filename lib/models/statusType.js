'use strict';

const mongoose = require('mongoose');

// Construct Schema

const statusTypesSchema = new mongoose.Schema({
    status: {type: String, required: true, index: true}
});

require('../managers/statusType')(statusTypesSchema);

// Export model
module.exports = mongoose.model('StatusTypes', statusTypesSchema);
