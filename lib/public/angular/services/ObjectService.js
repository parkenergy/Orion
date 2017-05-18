angular.module('CommonServices')
.factory('ObjectService', [function () {
  var ObjectService = {};

  // Change A nested Value of an Object based on a String
  ObjectService.updateNestedObjectValue = function (object, newValue, path) {
    _.update(object,path, function(n){
      n = newValue;
      return n;
    });
  };
  // -----------------------------------------------

  // Change A non Nested Value of an Object based on String
  ObjectService.updateNonNestedObjectValue = function (object, newValue, path) {
    object[path] = newValue;
  };
  // -----------------------------------------------

  // Return nested value of object based on String -
  ObjectService.getNestedObjectValue = function (object, path) {
    var stack = path.split('.');
    while(stack.length > 1){
      object = object[stack.shift()];
    }
    return object[stack.shift()];
  };
  // -----------------------------------------------


  return ObjectService;
}]);
