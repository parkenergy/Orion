angular.module('PartApp.Controllers').controller('PartEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Parts', 'part', 'vendors', 'enumeration', '$window', 'VendorParts',
  function ($scope, $route, $location, AlertService, LoaderService, Parts, part, vendors, enumeration, $window, VendorParts) {

    $scope.title = part ? "Edit " + part.smartPartNumber : "Create a new part";
    $scope.vendors = vendors;

    if (part) {
      $scope.part = part;
      $scope.part.revision = $scope.part.revision + 1;
    } else {
      $scope.part = emptyPart();
    }

    $scope.enumeration = enumeration.part;
    $scope.systems = $scope.enumeration.systemNames();
    $scope.engines = $scope.enumeration.engineNames();
    $scope.compressors = $scope.enumeration.compressorNames();

    $window.scope = $scope;

    function emptyPart () {
      $scope.disallowSave = true;
      return {
        vendorPartNumber: "",
        description: "",
        quantity: 0,
        cost: 0,
        system: 0,
        subsystem: 0,
        component: 0,
        revision: 0,
        vendorParts: []
      };
    }

    $scope.$watch('part', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.part.smartPartNumber = $scope.enumeration.smartPartNumber($scope.part);
        if (!newVal.description || newVal.system <= 0 || newVal.subsystem <= 0) {
          $scope.disallowSave = true;
        } else {
          $scope.disallowSave = false;
        }
      }
    }, true);

    $scope.$watch('part.system', function (newVal, oldVal) {
      $scope.subsystemsLoading = true;
      $scope.subsystems = $scope.enumeration.subsystemNames($scope.part);
      $scope.subsystemsLoading = false;
    }, true);

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.part.id) {
        // Edit an existing part.
        Parts.save({id: part.id}, $scope.part,
          function (response) {
            $location.path("/part");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new part.
        Parts.save({}, $scope.part,
          function (response) {
            if ($scope.part.unsavedVendorParts && $scope.part.unsavedVendorParts.length > 0) {
              $scope.part.id = response.id;
              console.log("part.id: ", $scope.part.id);
              console.log("unsavedVendorParts: ", $scope.part.unsavedVendorParts);
              $scope.saveMultipleVendorParts($scope.part.unsavedVendorParts,
                function (err) {
                  if (err) { AlertService.add("error", err); }
                  else {
                    AlertService.add("success", "Vendors successfully saved.");
                    //$location.path("/part");
                    $scope.submitting = false;
                  }
                });
            } else {
              $location.path("/part");
              $scope.submitting = false;
            }
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
      Parts.delete({id: part.id},
        function (response) {
          $location.path("/part");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

    $scope.saveMultipleVendorParts = function (vendorParts, callback) {
      if (vendorParts && vendorParts.length > 0) {
        // save one and recursively call self.
        var vp = vendorParts.pop();
        vp.PartId = $scope.part.id;
        console.log("vp: ", vp);
        VendorParts.save({}, vp,
          function (response) {
            console.log("response: ", response);
            AlertService.add("success", "That vendor was successfully added.");
            $scope.saveMultipleVendorParts(vendorParts, callback);
          },
          function (err) {
            return callback(err);
          }
        );
      } else {
        return callback(null);
      }
    };

}]);
