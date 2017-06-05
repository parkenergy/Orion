angular.module('LocationApp.Controllers').controller('LocationEditCtrl',
['$scope', '$route', '$location', 'AlertService', 'Locations', 'location', 'customers', 'areas', 'states', 'counties',
  function ($scope, $route, $location, AlertService, Locations, location, customers, areas, states, counties) {

    $scope.title = location ? "Edit " + location.name : "Create a new location";

    $scope.location = location;
    $scope.customers = customers;
    $scope.states = states;
    $scope.counties = counties;
    $scope.locationTypes = [{name:"Lease"},{name:"Truck"}, {name:"Yard"}];

    $scope.$watch('location.state', function (newVal, oldVal) {
      if (newVal != oldVal) {
        if (newVal === null) { $scope.counties = counties; }
        $scope.counties = getCountiesForState(counties, newVal);
      }
    }, true);

    $scope.$watch('location.county', function (newVal, oldVal) {
      if (newVal != oldVal) {
        if (newVal === null) { $scope.states = states; }
        counties.forEach(function (ele, ind, arr) {
          if (ele._id == newVal) {
            $scope.location.state = ele.state._id;
          }
        });
      }
    }, true);

    $scope.save = function () {
      $scope.submitting = true;
      if ($scope.location._id) {
        // Edit an existing location.
        Locations.save({_id: $scope.location._id}, $scope.location,
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
        Locations.save({name: $scope.location.name}, $scope.location,
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

    function getCountiesForState(counties, state) {
      var countyArr = [];
      if (state) {
        counties.forEach(function (ele) {
          if (ele.state._id == state) { countyArr.push(ele); }
        });
      } else {
        countyArr = counties;
      }
      countyArr.sort(function (a, b) {
        if (a.name > b.name) { return 1; }
        if (a.name < b.name) { return -1; }
        else { return 0; }
      });
      return countyArr;
    }
}]);
