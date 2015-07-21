/* Includes
----------------------------------------------------------------------------- */
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

/* Declaration
----------------------------------------------------------------------------- */
var Models = function () {
  var models = {};

  fs.readdirSync(__dirname).filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  }).forEach(function (file) {
    var model = require('./'+file);
    var modelName = model.collection.name;
    models[modelName] = model;
  });

  return models;
};

/* Exports
----------------------------------------------------------------------------- */
module.exports = Models();
