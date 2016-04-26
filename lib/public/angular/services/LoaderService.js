angular.module('CommonServices')
.factory('LoaderService', ['$rootScope', function ($rootScope) {

  var LoaderService = {};
  $rootScope.showLoader = false;

  LoaderService.show = function () {
    $rootScope.showLoader = true;
  };

  LoaderService.hide = function () {
    $rootScope.showLoader = false;
  };

  return LoaderService;

}]);
