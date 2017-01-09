/**
 *            oppType
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';

var ObjectId = require('mongoose').Types.ObjectId,
    _        = require('lodash'),
    Promise  = require('bluebird');


module.exports = function (oppTypesSchema) {

  /*** MODEL METHODS ***/

  //list documents
  oppTypesSchema.statics.list = function () {
    var self = this;
    return new Promise(function (resolve, reject) {

      self.find()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

};
