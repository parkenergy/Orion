'use strict';

const mongoose = require('mongoose');

const syncDataSchema = new mongoose.Schema({
  username: {type: String, required: true},
  date: {type: Date, require: true, index: true},
  hostName: {type: String},
  compUser: {type: String},
  version: {type: String},
});

syncDataSchema.index({date: 1});

syncDataSchema.set('toJSON', { getters: true, virtuals: true });
syncDataSchema.set('toObject', { getters: true, virtuals: true });


require('../managers/syncData')(syncDataSchema);


//Export model
module.exports = mongoose.model('SyncData', syncDataSchema);
