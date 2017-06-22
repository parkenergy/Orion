angular.module('VendorPartApp.Controllers').controller('VendorPartEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'VendorParts', 'vendorpart','vendors', 'parts', 'role',
  function ($scope, $route, $location, AlertService, VendorParts, vendorpart, vendors, parts, role) {

    $scope.title = vendorpart ? "Edit " + vendorpart.vendorPartNumber :
                                "Create a new vendor";

    if (vendorpart) {
      $scope.vendorpart = vendorpart;
    }

    $scope.vendors = vendors;
    $scope.parts = parts;

    $scope.$watch('vendorpart.PartId', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        var oldPart = getPartById(oldVal);
        var newPart = getPartById(newVal);
        if (!$scope.vendorpart.vendorPartDescription) {
          $scope.vendorpart.vendorPartDescription = newPart.description;
        } else if ($scope.vendorpart.vendorPartDescription === oldPart.description) {
          $scope.vendorpart.vendorPartDescription = newPart.description;
        } else {
          // user has input a description.
          // don't change it automatically.
        }
      }
    }, true);

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.vendorpart._id) {
        // Edit an existing vendor.
        VendorParts.save({id: vendorpart._id}, $scope.vendorpart,
          function (response) {
            $location.path("/vendorpart");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new vendor.
        VendorParts.save({}, $scope.vendorpart,
          function (response) {
            $location.path("/vendorpart");
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
      VendorParts.delete({id: vendorpart._id},
        function (response) {
          $location.path("/vendorpart");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

    function getPartById (id) {
      if (!id) { return null; }
      var parts = $scope.parts.filter(function (p) {
        return p._id === id;
      });
      if (parts.length < 0) { return null; }
      return parts[0];
    }

}]);
