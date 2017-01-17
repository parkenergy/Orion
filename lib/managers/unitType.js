/**
 *            unitType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

const Promise    = require('bluebird');

module.exports = function (unitTypesSchema) {

  /*** MODEL METHODS ***/

  //list documents
  unitTypesSchema.statics.list = function () {
    return new Promise((resolve, reject) => {

      this.find()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

};
