'use strict';

const ObjectId   = require('mongoose').Types.ObjectId,
    User           = require('../models/user'),
    ClientError    = require('../errors/client');


module.exports = function(reviewNoteSchema) {

    /*** MODEL METHODS ***/

    //Create Document/s
    reviewNoteSchema.statics.createDoc = function(data) {

        return new Promise((resolve, reject) => {
            if(!data.workOrder) return reject(new ClientError("Missing workOrder ID on Note"));
            if(!data.user) return reject(new ClientError("Missing User on Note"));
            if(typeof data.workOrder === 'string') data.workOrder = ObjectId(data.workOrder);

            this.create(data)
                .then(resolve)
                .catch(reject);
        });
    };

    //update single document
    reviewNoteSchema.statics.updateDoc = function(id, data) {

        return new Promise((resolve, reject) => {
            if(!id) reject(new ClientError("Missing _id"));
            if(typeof id === "string") id = ObjectId(id);

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    //fetch by _id
    reviewNoteSchema.statics.fetch = function(id) {

        return new Promise((resolve, reject) => {
            if(typeof id === "string") id = ObjectId(id);

            this.findById(id)
                .lean()
                .exec()
                .then(this.populateTechs)
                .then(resolve)
                .catch(reject);

        });
    };

    //list documents
    reviewNoteSchema.statics.list = function(options) {

        return new Promise((resolve, reject) => {
            if(typeof options.workOrder === "string") options.workOrder = ObjectId(options.workOrder);

            //query model
            this.find({workOrder: options.workOrder ? options.workOrder : null})
                .sort({updated_at: -1})
                .lean()
                .exec()
                .then(this.populateTechs)
                .then(resolve)
                .catch(reject);
        });
    };

    //Delete document
    reviewNoteSchema.statics.delete = function(id) {

        return new Promise((resolve, reject) => {
            if(typeof id === "string") id = ObjectId(id);

            this.findOneAndRemove({id})
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    reviewNoteSchema.statics.populateTechs = function (reviewNotes) {
        return new Promise((resolve, reject) => {
            const userNames = reviewNotes.map(note => note.user);
            const userMap = {};
            // in tents & cool beans
            User.find({username: {$in: userNames}})
                .lean()
                .exec()
                .then((users)=>users.map((user)=>userMap[user.username]=user))
                .then(() => reviewNotes.map((note) => {
                    note.tech = userMap[note.user];
                    return note;
                }))
                .then(resolve)
                .catch(reject);
        });
    };

    /*** DOCUMENT METHODS ***/

    reviewNoteSchema.methods.getCreateDate = function() {
        return new Date(this._id.getTimestamp());
    };



};
