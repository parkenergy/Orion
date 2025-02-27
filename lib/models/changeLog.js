'use strict';

const mongoose = require('mongoose');

const changeLogSchema = new mongoose.Schema({
    name: {type: String, required: true},
    changed: {type: [String], default: []},
    added: {type: [String], default: []},
    removed: {type: [String], default: []},
    changeMade: {type: Date, required: true},
});

changeLogSchema.index({name: 1});

changeLogSchema.set('toJSON', { getters: true, virtuals: true });
changeLogSchema.set('toObject', { getters: true, virtuals: true });

require('../managers/changeLog')(changeLogSchema);

module.exports = mongoose.model('ChangeLogs', changeLogSchema);



