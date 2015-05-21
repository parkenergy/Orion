angular.module('WorkOrderApp.Controllers').controller('WorkOrderEditCtrl',
['$window', '$scope', '$location', 'AlertService', 'WorkOrders', 'workorder', 'units', 'customers', 'users', 'parts', 'role',
  function ($window, $scope, $location, AlertService, WorkOrders, workorder, units, customers, users, parts, role) {

    $scope.title = (workorder !== null ? "Edit " : "Create ") + "Work Order";

    $scope.toggleHistory = function () {
      $scope.showHistory = !$scope.showHistory || true;
    };


    $scope.save = function () {
      $scope.submitting = true;
      WorkOrders.save($scope.workorder, function (err, data) {
        if (err) {
          data = { err: err, workorder: $scope.workorder };
          ErrorService(data);
          console.log(data);
          AlertService.add("danger", "An error occurred while attempting to save.");
          $scope.submitting = false;
        } else {
          AlertService.add("success", "Save was successful!");
          $scope.submitting = false;
          $location.path("/workorder");
        }
      });
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      WorkOrders.destroy($scope.workorder, function (err, data) {
        if (err) {
          data = { err: err, workorder: $scope.workorder };
          ErrorService(data);
          console.log(data);
          AlertService.add("danger", "An error occurred while attempting to delete.");
          $scope.submitting = false;
        } else {
          AlertService.add("success", $scope.submitButtonText + " was successful!");
          $scope.submitting = false;
          $location.path("/workorder");
        }
      });
    };

}]);
