var needle = require('needle');
var async = require('async');
var Customer = require('../../models/customer.js');
var exec = require('child_process').exec,
  child;

var url = 'http://orion.parkenergyservices.com/api/customers';

function getCustomers(callback){
  var self = this;
  var customerArray
  needle.get(url, function(err, data){
    if(err){return callback(err);}
    if(!err && data.statusCode !== 200){
      var e = new Error('Error occurred while attempting to pull data');
      return callback(e);
    }
    else{
      //console.log(data.body);
      customerArray = Object.keys(data.body).map(function(_id){
        return data.body[_id];
      });
    }
    async.eachSeries(customerArray, upsertCustomers, function(err){
      if(err){ return callback(err); }
      Customer.find({}, function(err,data){
        return callback(err,data);
      });
    });
  });
}


function upsertCustomers(customer, callback) {
  delete customer._id;
  delete customer.__v;
  Customer.findOneAndUpdate(
    {netsuiteId: customer.netsuiteId},
    customer,
    { upsert: true, new: true }
  ).exec(callback);
}

module.exports = getCustomers;
