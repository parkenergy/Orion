angular.module('UnitApp.Controllers').controller('UnitEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Units', 'unit', 'servicePartners', 'Locations',
  function ($scope, $route, $location, AlertService, LoaderService, Units, unit, servicePartners, Locations) {

    $scope.title = unit ? "Edit unit number " + unit.number :
                          "Create a new unit";

    $scope.unit = unit || newUnit();
    $scope.unit.pressureRating = $scope.unit.pressureRating || "LOW";
    $scope.unit.status = $scope.unit.status || getImpliedStatus();
    $scope.servicePartners = servicePartners;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.unit.id) {
        // Edit an existing unit.
        Units.save({id: unit.id}, $scope.unit,
          function (response) {
            $location.path("/unit");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new unit.
        Units.save({}, $scope.unit,
          function (response) {
            $location.path("/unit");
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
      Units.delete({id: unit.id},
        function (response) {
          $location.path("/unit");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

    function getImpliedStatus() {
      var hasCustomer = $scope.unit.CustomerId;
      var isOnYard = $scope.unit.location && $scope.unit.location.isYard();
      if (isOnYard) {
        return "IDLE AVAILABLE";
      } else if (hasCustomer) {
        return "ACTIVE LEASE";
      }
    }

    function newUnit() {
      return {
        statuses: ["IDLE AVAILABLE", "IDLE COMMITTED"],
        engineHours: 0,
        compressorHours: 0
      };
    }

    $scope.$watch('unit.ServicePartnerId', function (newVal, oldVal) {
      var id = newVal;
      if (id !== null && id !== undefined) {
        $scope.locations = [];
        $scope.locationsLoading = true;
        Locations.query({ where: { ServicePartnerId: id} },
          function (response) {
            $scope.locationsLoading = false;
            $scope.locations = filterLocations(response);
          },
          function (err) {
            $scope.locationsLoading = false;
            AlertService.add("error", err);
          }
        );
      }
    }, true);

    function filterLocations (locations) {
      var newLocations = locations.filter(function (location) {
        var shouldBeIncluded = true;
        if (!$scope.unit.id) {
          if (location.isYard() === false) {
            shouldBeIncluded = false;
          }
        }
        return shouldBeIncluded;
      });
      return newLocations;
    }

}]);
