'use strict';

module.exports = function (unitTypesSchema) {

    /*** MODEL METHODS ***/

    //list documents
    unitTypesSchema.statics.list = function () {
        return new Promise((resolve, reject) => {

            this.find()
                .exec()
                .then(resolve).catch(reject);
        });
    };

};
