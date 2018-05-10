/**
 *            title
 *
 * Created by marcusjwhelan on 1/9/17.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
'use strict';


module.exports = function (titlesSchema) {

  /*** MODEL METHODS ***/

  //list documents
  titlesSchema.statics.list = function () {
    return new Promise((resolve, reject) => {
      this.find()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

};
