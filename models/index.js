var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

var Models = function () {
  var models = {};

  fs.readdirSync(__dirname).filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  }).forEach(function (file) {
    var model = require('./'+file);
    models[model.collection.name] = model;
  });

  return models;
};

module.exports = Models();
