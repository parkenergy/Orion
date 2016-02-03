angular.module('CommonControllers').controller('MyAccountCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'workorders',
  function ($scope, $route, $location, AlertService, LoaderService, workorders) {

    $scope.title = "My Account";
    $scope.workorders = workorders;

    $scope.clickWorkOrder = function() {
        var wo = this.workorder;
        $scope.selected = wo;
        console.log(wo);

        $location.url('/workorder/review/' + wo._id);
      };

    $scope.createWorkOrder = function () {
      $location.path('/workorder/create');
    };

}]);
