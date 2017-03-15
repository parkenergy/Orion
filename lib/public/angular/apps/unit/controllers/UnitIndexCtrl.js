angular.module('UnitApp.Controllers').controller('UnitIndexCtrl',
['$scope', '$route', '$location', 'AlertService',
  function ($scope, $route, $location, AlertService) {

    $scope.title = "Units Map";

    $scope.units = [];
}]);
