angular.module('UnitApp.Controllers').controller('UnitIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'units',
  function ($scope, $route, $location, AlertService, units) {

    $scope.title = "Units Map";
    $scope.units = units;
}]);
