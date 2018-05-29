'use strict';


module.exports = function (statusTypesSchema) {

    /*** MODEL METHODS ***/

    //list documents
    statusTypesSchema.statics.list = function () {
        return new Promise((resolve, reject) => {

            this.find()
                .exec()
                .then(resolve)
                .catch(reject)
        })
    }

};
