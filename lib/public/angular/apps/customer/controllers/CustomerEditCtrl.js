angular.module('CustomerApp.Controllers').controller('CustomerEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'Customers', 'customer', 'locations',
  function ($scope, $route, $location, AlertService, Customers, customer, locations) {

    $scope.title = customer ? "Edit " + customer.dbaCustomerName :
                              "Create a new customer";

    $scope.customer = customer;
    $scope.locations = locations;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.customer._id) {
        // Edit an existing customer.
        Customers.save({_id: customer._id}, $scope.customer,
          function (response) {
            $location.path("/customer");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new customer.
        Customers.save({}, $scope.customer,
          function (response) {
            $location.path("/customer");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      }
    };

    $scope.destroy = function () {
      $scope.submitting = true;
      Customers.delete({id: customer._id},
        function (response) {
          $location.path("/customer");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);
