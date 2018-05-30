'use strict';

module.exports = function (activityTypesSchema) {

    /*** MODEL METHODS ***/

    //list documents
    activityTypesSchema.statics.list = function () {
        return new Promise((resolve, reject) => {

            this.find()
                .exec()
                .then(resolve).catch(reject);
        });
    };

};
