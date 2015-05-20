angular.module('VendorApp.Controllers').controller('VendorEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Vendors', 'vendor', 'vendorFamilies', 'role',
  function ($scope, $route, $location, AlertService, LoaderService, Vendors, vendor, vendorFamilies, role) {

    $scope.title = vendor ? "Edit " + vendor.name : "Create a new vendor";

    if (vendor) {
      $scope.vendor = vendor;
    }

    $scope.vendorFamilies = vendorFamilies;

    $scope.vendorFamilies.push({name: "Other", id: 0});

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.vendor.id) {
        // Edit an existing vendor.
        Vendors.save({id: vendor.id}, $scope.vendor,
          function (response) {
            $location.path("/vendor");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new vendor.
        Vendors.save({}, $scope.vendor,
          function (response) {
            $location.path("/vendor");
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
      Vendors.delete({id: vendor.id},
        function (response) {
          $location.path("/vendor");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

}]);
