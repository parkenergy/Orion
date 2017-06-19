/* Manager
 --- userSchema ---

 Orion User


 Author: Travis Sturzl &lt;travissturzl@gmail.com&gt;
 */
'use strict';

const ObjectId  = require('mongoose').Types.ObjectId,
  request       = require('request-promise'),
  log           = require('../helpers/logger'),
  Promise       = require('bluebird'),
  AuthError     = require('../errors/auth');

module.exports = function (userSchema) {

  /*** MODEL METHODS ***/

  //Create Document/s
  userSchema.statics.createDoc = function (data) {

    const dataArr = [].concat(data); //Ensure data is an array, cast single object to array
    return new Promise( (resolve, reject) => {
      this.insertMany(dataArr)
        .then(resolve)
        .catch(reject);
    });
  };

  //update single document
  userSchema.statics.updateDoc = function (id, data) {

    return new Promise( (resolve, reject) => {

      this.findOneAndUpdate({username: id}, data, {safe: false, new: true})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //fetch by username
  userSchema.statics.fetch = function (id, identity) {

    return new Promise( (resolve, reject) => {

      if (id === 'me') {
        if(!identity) return reject(new AuthError("You are not authenticated"));
        id = identity.username;
      }

      this.findOne({username: id})
        .lean()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //identify user by token
  userSchema.statics.identify = function (token) {

    //log.trace({token: token}, "Identify by token");
    return new Promise( (resolve, reject) => {
      request.get({
        url: "https://www.googleapis.com/userinfo/v2/me",
        headers: {
          Authorization: token
        }
      })
        .then((identity) => {
          if(typeof identity === 'string') identity = JSON.parse(identity);
          //log.trace({resp: identity}, "Google responded");
          if(!identity || !identity.email) return reject(new AuthError("Unable to identify user"));

          return this.findOne({email: {$regex: identity.email, $options: 'i'}});
        })
        .then(user => {
          //log.trace({user: user}, "Identify as user");
          resolve(user);
        })
        .catch(reject);
    });
  };

  //list documents
  userSchema.statics.list = function (options) {

    return new Promise( (resolve, reject) => {
      //query object
      const q = {};

      //date range filter
      if(options.from) {
        q.updated_at = {
          $gte: options.from,
          $lt: options.to || new Date()
        };
      }
      
      // text search on tech id
      if(options.text){
        if(options.text.username !== null){
          q.$text = {$search: `${options.text.username}`};
        }
      }

      if(options.supervisor) {
        q.supervisor = options.supervisor;
      }
      
      // Add Regex search for a users full name.
      if(options.regex) {
        if(options.regex.fullName){
          q.$or = [
            { firstName: { $regex: `^${options.regex.fullName}.*` }},
            { lastName: { $regex: `^${options.regex.fullName}.*` }}
          ];
        }
        if(options.regex.area) {
          if(q.$or) {
            q.$or.push({area: {$regex: `.*${options.regex.area}.*`}});
          } else {
            q.$or = [{ area: {$regex: `.*${options.regex.area}.*`}}];
          }
        }
      }

      //sort string eg 'field' or '-field'
      const sort = options.sort || '-updated_at';

      //Pagenation
      const size = options.size || 50;
      const page = options.page ? options.page * size : 0;

      //log.debug({q, size, page, sort}, "User Query");
      
      //query model
      this.find(q)
        .skip(page)
        .limit(size)
        .sort(sort)
        .lean()
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Delete document
  userSchema.statics.delete = function (id) {

    return new Promise((resolve, reject) => {
      if(typeof id === "string") id = ObjectId(id);

      this.findOneAndRemove({id})
        .exec()
        .then(resolve)
        .catch(reject);
    });
  };

  //Get techs for supervisor
  userSchema.statics.getTechsForSupervisor = function (supervisor) {
    log.trace({techId: supervisor}, "Get Techs for Supervisor");

    return new Promise( (resolve, reject) => {
      this.find({supervisor}, {username: 1})
        .lean()
        .exec()
        .map(tech => tech.username)
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
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
