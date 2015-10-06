var needle = require('needle');
var async = require('async');
var User = require('../../models/user.js');
var exec = require('child_process').exec,
  child;

// the url of where the api is exposed to allow us to retrieve user data
var url = 'http://orion.parkenergyservices.com/api/users';

function getUsers(callback){
  var self = this;
  var userArray = [];
  needle.get(url, function(err,data){
    if(err){return callback(err);}
    if(!err && data.statusCode !== 200){
      var e = new Error('Error occurred while pulling users');
      return callback(e);
    }
    else{
      userArray = Object.keys(data.body).map(function(_id){
        return data.body[_id];
      });
    }
    async.eachSeries(userArray, upsertUsers, function(err){
      if(err){ return callback(err); }
      User.find({}, function(err,data){
        return callback(err,data);
      });
    });
  });
}

function upsertUsers(user, callback){
  delete user._id;
  delete user.__v;
  User.findOneAndUpdate(
    {netsuiteId: user.netsuiteId},
    user,
    { upsert: true, new: true }
  ).exec(callback);
}

module.exports = getUsers;
