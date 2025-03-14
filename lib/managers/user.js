'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
    axios = require('axios'),
    log = require('../helpers/logger'),
    AuthError = require('../errors/auth');

module.exports = function (userSchema) {

    /*** MODEL METHODS ***/

    //Create Document/s
    userSchema.statics.createDoc = function (data) {

        const dataArr = [].concat(data); //Ensure data is an array, cast single object to array
        return new Promise( (resolve, reject) => {
            this.insertMany(dataArr)
                .then(resolve)
                .catch(reject);
        });
    };

    //update single document
    userSchema.statics.updateDoc = function (id, data) {

        return new Promise( (resolve, reject) => {

            this.findOneAndUpdate({username: id}, data, {safe: false, new: true})
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    //fetch by username
    userSchema.statics.fetch = function (id, identity) {

        return new Promise( (resolve, reject) => {

            if (id === 'me') {
                if(!identity) return reject(new AuthError("You are not authenticated"));
                id = identity.username;
            }

            this.findOne({username: id})
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    userSchema.statics.sync = function (options) {
        return new Promise((resolve, reject) => {
            const q = {};
            if (options.netsuiteId) {
                q.netsuiteId = {
                    $in: options.netsuiteId,
                };
            }
            this.find(q)
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    //identify user by token
    userSchema.statics.identify = function (token) {
        return new Promise( (resolve, reject) => {
            let parts = token.split('.')
            if (parts.length == 2) {
                axios.get("https://www.googleapis.com/userinfo/v2/me", {
                    headers: {
                        Authorization: token
                    }
                })
                .then((identity) => {
                    identity = identity.data;
                    if(typeof identity === 'string') identity = JSON.parse(identity);
                    if(!identity || !identity.email) return reject(new AuthError("Unable to identify user"));

                    return this.findOne({email: {$regex: identity.email, $options: 'i'}});
                })
                .then(resolve)
                .catch(reject);
            } else {
                let identity = JSON.parse(Buffer.from(parts[1], 'base64').toString()).unique_name

                if (!identity) {
                    reject(new AuthError("Unable to identify user"))
                } else {
                    resolve(this.findOne({email: {$regex: identity, $options: 'i'}}))
                }
            }
        });
    };

    //list documents
    userSchema.statics.list = function (options) {

        return new Promise( (resolve, reject) => {
            //query object
            const q = {};

            //date range filter
            if(options.from) {
                q.updated_at = {
                    $gte: options.from,
                    $lt: options.to || new Date()
                };
            }

            // text search on techId
            if(options.text){
                if(options.text.username !== null){
                    q.$text = {$search: `${options.text.username}`};
                }
            }

            // no text search just get user
            if (options.userName) {
                q.username = options.userName;
            }

            if(options.supervisor) {
                q.supervisor = options.supervisor;
            }

            // Add Regex search for a users full name.
            if(options.regex) {
                if(options.regex.fullName){
                    q.$or = [
                        { firstName: { $regex: `^${options.regex.fullName}.*` }},
                        { lastName: { $regex: `^${options.regex.fullName}.*` }}
                    ];
                }
                if(options.regex.area) {
                    if(q.$or) {
                        q.$or.push({area: {$regex: `.*${options.regex.area}.*`}});
                    } else {
                        q.$or = [{ area: {$regex: `.*${options.regex.area}.*`}}];
                    }
                }
            }

            //sort string eg 'field' or '-field'
            const sort = options.sort || '-updated_at';

            //Pagenation
            const size = options.size || 50;
            const page = options.page ? options.page * size : 0;

            //log.debug({q, size, page, sort}, "User Query");

            const cursor = this.find(q)

            if (options.page) {
                cursor
                    .skip(page)
                    .limit(size)
            }
            //query model
            cursor
                .sort(sort)
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    //Delete document
    userSchema.statics.delete = function (id) {

        return new Promise((resolve, reject) => {
            if(typeof id === "string") id = ObjectId(id);

            this.findOneAndRemove({id})
                .exec()
                .then(resolve)
                .catch(reject);
        });
    };

    //Get techs for supervisor
    userSchema.statics.getTechsForSupervisor = function (supervisor) {
        log.trace({techId: supervisor}, "Get Techs for Supervisor");

        return new Promise( (resolve, reject) => {
            this.find({supervisor}, {username: 1})
                .lean()
                .exec()
                .then((techs)=>techs.map((tech)=>tech.username))
                .then(resolve)
                .catch(reject);
        });
    };

    /*** DOCUMENT METHODS ***/

    userSchema.methods.getCreateDate = function () {
        return new Date(this._id.getTimestamp());
    };

};

/*** PRIVATE METHODS ***/

/*function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}*/
