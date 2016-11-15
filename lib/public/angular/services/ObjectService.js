/**
 *            ObjectService
 *
 * Created by marcusjwhelan on 11/15/16.
 *
 * Contact: marcus.j.whelan@gmail.com
 *
 */
angular.module('CommonServices')
.factory('ObjectService', [function () {
  var ObjectService = {};

  // Change A nested Value of an Object based on a String ---
  ObjectService.updateObject = function (object, newValue, path) {
    var stack = path.split('.');
    while(stack.length > 1 ){
      object = object[stack.shift()];
    }
    object[stack.shift()] = newValue;
  };
  // --------------------------------------------------------


  return ObjectService;
}]);
