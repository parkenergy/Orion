/* Manager
 --- userSchema ---

 Orion User


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

var ObjectId  = require('mongoose').Types.ObjectId,
  request     = require('request-promise'),
  _           = require('lodash'),
  log         = require('../helpers/logger'),
  Promise     = require('bluebird');


module.exports = function (userSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  userSchema.statics.createDoc = function (data) {
    var self = this;

    var dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise(function (resolve, reject) {
      self.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  userSchema.statics.updateDoc = function (id, data) {
    var me = this;
    return new Promise(function (resolve, reject) {
      if(typeof id === "string") id = ObjectId(id);

      me.findByIdAndUpdate(id, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by _id
  userSchema.statics.fetch = function (id) {
    var self = this;

    return new Promise(function (resolve, reject) {

      if (typeof id === "string") id = ObjectId(id);

      self.findById(id)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //identify user by token
  userSchema.statics.identify = function (token) {
    var self = this;

    log.trace({token: token}, "Identify by token");
    return new Promise(function (resolve, reject) {
      request.get({
        url: "https://www.googleapis.com/userinfo/v2/me",
        headers: {
          Authorization: token
        }
      })
        .then(function (identity) {
          if(typeof identity === 'string') identity = JSON.parse(identity);
          log.trace({resp: identity}, "Google responded");
          if(!identity || !identity.email) return reject(new Error("Unable to identify user"));

          return self.findOne({email: {$regex: identity.email, $options: 'i'}});
        })
        .then(function (user) {
          log.trace({user: user}, "Identify as user");
          resolve(user);
        })
        .catch(reject);
    });
  };

  //list documents
  userSchema.statics.list = function (options) {
    var self = this;

    return new Promise(function (resolve, reject) {
      //query object
      var q = {};

      //date range filter
      if(options.from) {
        q.updated_at = {
          $gte: options.from,
          $lt: options.to || new Date()
        };
      }

      if(options.supervisor) {
        q.supervisor = options.supervisor;
      }

      //sort string eg 'field' or '-field'
      var sort = options.sort || '-updated_at';

      //Pagenation
      var size = options.size || 50;
      var page = options.page ? options.page * size : 0;

      //query model
      self.find(q)
        .skip(page)
        .limit(size)
        .sort(sort)
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  userSchema.statics.delete = function (id) {
    var self = this;

    return new Promise(function (resolve, reject){
      if(typeof id === "string") id = ObjectId(id);

      self.findOneAndRemove({id: id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Get techs for supervisor
  userSchema.statics.getTechsForSupervisor = function (supervisor) {
    log.trace({techId: supervisor}, "Get Techs for Supervisor");
    var self = this;

    return new Promise(function (reject, resolve) {
      self.find({supervisor: supervisor})
        .exec()
        .map(function (tech) {
          return tech.username;
        })
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

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
