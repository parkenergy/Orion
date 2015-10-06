angular.module('CommonServices')
.factory('RedirectService', ['$location', function ($location) {

  var RedirectService = {};

  RedirectService.getEditRedirectFn = function (model) {
    return function (obj) {
      var id = obj ? obj._id : undefined;
      $location.path("/" + model + "/edit/" + (id || ""));
    };
  };

  RedirectService.getIndexRedirectFn = function (model) {
    return function () { $location.path("/" + model); };
  };

  return RedirectService;

}]);
