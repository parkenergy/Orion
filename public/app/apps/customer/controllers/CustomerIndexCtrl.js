angular.module('CustomerApp.Controllers').controller('CustomerIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'customers',
  function ($scope, $route, $location, AlertService, LoaderService, customers) {

    $scope.title = "Customers";

    $scope.customers = customers;

    $scope.editCustomer = function (id) {
      $location.path("/customer/edit/" + (id || ""));
    };

    $scope.createCustomer = function () {
      $scope.editCustomer();
    };

    $scope.sort = {
      column: "dbaCustomerName",
      descending: false,
    };

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
