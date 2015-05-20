angular.module('Orion.Controllers').controller('DashboardCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService',
  function ($scope, $route, $location, AlertService, LoaderService) {

    $scope.createWorkOrder = function () {
      $location.path('/workorder/create');
    };

    $scope.sort = {
      column: ["status", "date", "number"],
      descending: [true],
    };

    $scope.workorders.forEach(function (wo) {
      var displayName = "";
      if (!wo.unit || !wo.unit.location || !wo.unit.location.name) {
        // do nothing
      } else if (wo.unit.location.name.length <= 20) {
        wo.displayLocationName = wo.unit.location.name;
      } else {
        wo.displayLocationName = wo.unit.location.name.slice(0,17) + "...";
      }

      displayName = "";
      if (!wo.unit || !wo.unit.location || !wo.unit.location.customer || !wo.unit.location.customer.dbaCustomerName) {
        // do nothing
      } else if (wo.unit.location.customer.dbaCustomerName.length <= 20) {
        wo.displayCustomerName = wo.unit.location.customer.dbaCustomerName;
      } else {
        wo.displayCustomerName = wo.unit.location.customer.dbaCustomerName.slice(0,17) + "...";
      }
    });

    $scope.changeSorting = function (column) {
      var sort = $scope.sort;
      if (sort.column == column) {
        sort.descending = !sort.descending;
      } else {
        sort.column = column;
        sort.descending = false;
      }
    };

}]);
