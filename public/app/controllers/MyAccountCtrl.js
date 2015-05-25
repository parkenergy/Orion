angular.module('Orion.Controllers').controller('MyAccountCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders',
  function ($scope, $route, $location, AlertService, LoaderService, workorders) {

    $scope.title = "My Account";
    $scope.workorders = workorders;

    $scope.createWorkOrder = function () {
      $location.path('/workorder/create');
    };

}]);
