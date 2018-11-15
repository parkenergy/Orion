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

    // setobjvalue
    ObjectService.setObjValue = (obj, path, value) => {
        if (typeof path === 'string') {
            return ObjectService.setObjValue(obj, path.split('.'), value)
        } else if (path.length === 1) {
            return obj[path[0]] = value
        } else if (path.length === 0) {
            return obj
        } else {
            return ObjectService.setObjValue(obj[path[0]], path.slice(1), value)
        }
    }

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
