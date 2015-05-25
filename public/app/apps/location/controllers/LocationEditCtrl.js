angular.module('LocationApp.Controllers').controller('LocationEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'Locations', 'location', 'customers', 'servicePartners', 'GeographyService',
  function ($scope, $route, $location, AlertService, LoaderService, Locations, location, customers, servicePartners, GeographyService) {

    $scope.title = location ? "Edit " + location.name : "Create a new location";

    $scope.location = location;
    $scope.customers = customers;
    $scope.servicePartners = servicePartners;
    $scope.states = GeographyService.states;

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.location._id) {
        // Edit an existing location.
        Locations.save({id: location._id}, $scope.location,
          function (response) {
            $location.path("/location");
            $scope.submitting = false;
          },
          function (err) {
            AlertService.add("error", err);
            $scope.submitting = false;
          }
        );
      } else {
        // Create a new location.
        Locations.save({}, $scope.location,
          function (response) {
            $location.path("/location");
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
      Locations.delete({id: location._id},
        function (response) {
          $location.path("/location");
          $scope.submitting = false;
        },
        function (err) {
          AlertService.add("error", err);
          $scope.submitting = false;
        }
      );
    };

    $scope.$watch('location.state', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.location.county = null;
        $scope.counties = GeographyService.counties(newVal);
      }
    }, true);

    (function () {
      if (!$scope.location || !$scope.location.state) {
        return;
      } else {
        $scope.counties = GeographyService.counties($scope.location.state);
        if ($scope.counties.indexOf($scope.location.county) == -1) {
          var message = "Please enter a valid county for this location.";
          AlertService.add("warning", message);
        }
      }
    })();

}]);
