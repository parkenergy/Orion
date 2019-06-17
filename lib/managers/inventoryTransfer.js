'use strict';

const ObjectId  = require('mongoose').Types.ObjectId;


module.exports = function (inventoryTransferSchema) {

    /*** MODEL METHODS ***/

    //Create Document/s
    inventoryTransferSchema.statics.createDoc = function (data) {

        const dataArr = [].concat(data); //Ensure data is an array, cast single
                                         // object to array
        return new Promise((resolve, reject) => {
            if (!data) return reject(
                new ClientError('Missing Inventory Transfer  Document'));
            let newArr;

            this.find({
                    inventorytransferDate: {
                        $in: dataArr.reduce((acc, o) => {
                            if (o.hasOwnProperty('inventorytransferDate')) {
                                return acc.concat(o.inventorytransferDate);
                            } else {
                                return acc;
                            }
                        }, [])
                    }
                })
                .then((foundDocs) => {
                    newArr = dataArr.map((doc) => {
                        let foundDup = {found: false};
                        foundDocs.forEach((fDoc) => {
                            if (new Date(fDoc.inventorytransferDate).getTime() === new Date(doc.inventorytransferDate).getTime()) {
                                foundDup = {obj: fDoc, found: true};
                            }
                        });
                        if (foundDup.found) {
                            return foundDup;
                        } else {
                            doc.inventorytransferDate = new Date(doc.inventorytransferDate).getTime()
                            return {obj: doc, found: false};
                        }
                    });
                    return newArr;
                })
                .then((objects) => {
                    const promises = []
                    objects.forEach((obj) => {
                        if (obj.found === false) {
                            promises.push(this.insert(obj.obj))
                        }
                    })
                    /*const insertObjects = objects.reduce((acc, cur) => {
                        if (cur.found === false) {
                            return acc.concat(cur.obj);
                        } else {
                            return acc;
                        }
                    }, []);
                    return this.insertMany(insertObjects);*/
                    return Promise.all(promises)
                })
                .then((docs) => {
                    const promises = [];
                    newArr.forEach((na) => {
                        docs.forEach((doc) => {
                            // inserted qi = submitted qi
                            if (new Date(doc.inventorytransferDate).getTime() === new Date(na.obj.inventorytransferDate).getTime()) {
                                if (!na.found) {
                                    promises.push(new Promise((res) => res(doc)));
                                } else {
                                    promises.push(new Promise((res) => res(na.obj)));
                                }
                            }
                        });
                       /* if (na.found) {
                            promises.push(new Promise((res) => res(na.obj)));
                        }*/
                    });
                    return Promise.all(promises);
                })
                .then(resolve)
                .catch(reject);
        });
    };

    //update single document
    inventoryTransferSchema.statics.updateDoc = function (id, data) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findByIdAndUpdate(id, data, {safe: false, new: true})
                .exec()
                .then(resolve).catch(reject);
        });
    };

    //fetch by _id
    inventoryTransferSchema.statics.fetch = function (id) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findById(id)
                .exec()
                .then(resolve).catch(reject);

        });
    };

    //list documents
    inventoryTransferSchema.statics.list = function (options) {

        return new Promise((resolve, reject) => {
            //query object
            const q = {};

            //date range filter
            if (options.from) {
                q.updated_at = {
                    $gte: options.from,
                    $lt: options.to || new Date()
                };
            }

            //sort string eg 'field' or '-field'
            const sort = options.sort || '-updated_at';

            //Pagenation
            const size = options.size || 50;
            const page = options.page ? options.page * size : 0;

            //query model
            this.find(q)
                .skip(page)
                .limit(size)
                .sort(sort)
                .exec()
                .then(resolve).catch(reject);
        });
    };

    //Delete document
    inventoryTransferSchema.statics.delete = function (id) {

        return new Promise((resolve, reject) => {
            if (typeof id === 'string') id = ObjectId(id);

            this.findOneAndRemove({id})
                .exec()
                .then(resolve).catch(reject);
        });
    };

    /*** DOCUMENT METHODS ***/

    inventoryTransferSchema.methods.getCreateDate = function () {
        return new Date(this._id.getTimestamp());
    };

};
