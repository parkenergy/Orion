'use strict';

module.exports = function (oppTypesSchema) {

    /*** MODEL METHODS ***/

    //list documents
    oppTypesSchema.statics.list = function () {
        return new Promise((resolve, reject) => {

            this.find()
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

};
