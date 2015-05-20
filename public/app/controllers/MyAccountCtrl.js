angular.module('Orion.Controllers').controller('MyAccountCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders', 'role',
  function ($scope, $route, $location, AlertService, LoaderService, workorders, role) {

    $scope.title = "My Account";
    $scope.workorders = workorders;
    $scope.role = role;

    $scope.createWorkOrder = function () {
      $location.path('/workorder/create');
    };

}]);
