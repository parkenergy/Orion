'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
    User = require('../models/user'),
    log = require('../helpers/logger');


module.exports = function (unitSchema) {

    /*** MODEL METHODS ***/

    //Create Document/s
    unitSchema.statics.createDoc = function (data) {

        const dataArr = [].concat(data); //Ensure data is an array, cast single
                                         // object to array
        return new Promise((resolve, reject) => {
            this.insertMany(dataArr)
                .then(resolve).catch(reject);
        });
    };

    //update single document
    unitSchema.statics.updateDoc = function (id, data) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve).catch(reject);
        });
    };

    //fetch by _id
    unitSchema.statics.fetch = function (unitNumber) {

        return new Promise((resolve, reject) => {

            this.findOne({number: unitNumber})
                .lean()
                .exec()
                .then(resolve).catch(reject);

        });
    };

    unitSchema.statics.sync = function (options) {
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
                .then(resolve).catch(reject);
        });
    };

    unitSchema.statics._count = function (options) {
        return new Promise((resolve, reject) => {
            let q = {};
            const Q = queryConstructor(options, q);
            q = Q.q;

            if (options.supervisor) {
                User.getTechsForSupervisor(options.supervisor)
                    .then(techs => {
                    q.assignedTo = {$in: techs};

                        //log.debug({q, size, page, sort}, "Unit Query(w/ supervisor)");

                        return this.find(q).count();
                    })
                    .then(resolve).catch(reject);
            } else {

                //query model
                this.find(q)
                    .count()
                    .then(resolve).catch(reject);
            }

        });
    };

    //list documents
    unitSchema.statics.list = function (options) {

        return new Promise((resolve, reject) => {

            //query object
            let q = {};
            const Q = queryConstructor(options, q);
            q = Q.q;

            //sort string eg 'field' or '-field'
            const sort = options.sort || '-updated_at';

            //Pagination
            const size = options.size || 50;
            const page = options.page ? options.page * size : 0;

            if (options.supervisor) {
                User.getTechsForSupervisor(options.supervisor)
                    .then(techs => {
                    let alltechs = [];
                    techs.push(options.supervisor);
                        if (options.techs) {
                            alltechs = techs.concat(options.techs);
                        } else {
                            alltechs = techs;
                        }
                    q.assignedTo = {$in: alltechs};

                    log.debug({q, size, page, sort},
                        'Unit Query(w/ supervisor)');

                        return this.find(q)
                            .skip(page)
                            .limit(size)
                            .sort(sort)
                            .lean().exec();
                    })
                    .then(resolve).catch(reject);
            } else {
                //query model
                this.find(q)
                    .skip(page)
                    .limit(size)
                    .sort(sort)
                    .lean()
                    .exec()
                    .then(resolve).catch(reject);
            }
        });
    };

    //Delete document
    unitSchema.statics.delete = function (id) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findOneAndRemove({id})
                .exec()
                .then(resolve).catch(reject);
        });
    };

    /*** DOCUMENT METHODS ***/

    unitSchema.methods.getCreateDate = function () {
        return new Date(this._id.getTimestamp());
    };
};

const queryConstructor = (options, q) => {
    //Search by Unit Number
    if (options.number) {
        q.number = options.number;
    }

    // Search by many Unit Numbers
    if (!options.number && options.numbers) {
        q.number = {$in: options.numbers};
    }

    //Search by Customer Name
    if (options.customer) {
        q.customerName = options.customer;
    }

    //Search by Tech username
    if (options.tech) {
        q.assignedTo = options.tech;
    }

    // Search by many Techs
    if (!options.tech && options.techs) {
        q.assignedTo = {$in: options.techs};
    }

    // Add regex search for unit number.
    if (options.regex) {
        if (options.regex.number && !options.number) {
            q.number = {
                // search only items beginning with this string.
                $regex: `^${options.regex.number.toUpperCase()}.*`
            };
        }
        if (options.regex.lease && !options.number) {
            q.locationName = {
                $regex: `^${options.regex.lease.toUpperCase()}.*`
            };
        }
    }

    //Geo Radius Search
    if (options.pos) {
        q.geo = {
            $nearSphere: {
                $geometry: {
                    type: 'Point',
                    coordinates: parseCoords(options.pos)
                },
                $maxDistance: (options.radius || 50) / 0.00062137
            }
        };
    }

    //Geo Within Search
    if (options.ne && options.sw) {
        let ne = parseCoords(options.ne);
        let sw = parseCoords(options.sw);

        q.geo = {
            $geoWithin: {
                $box: [ne, sw]
            }
        };
    }
    return {options, q};
};

//parse coordinates formatted like `lng:lat`
function parseCoords(pos) {
    let coords = pos.split(':');
    return [Number(coords[0]), Number(coords[1])];
}
