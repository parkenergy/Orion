angular.module('LocationApp.Controllers').controller('LocationIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'locations',
  function ($scope, $route, $location, AlertService, LoaderService, locations) {

    $scope.title = "Locations";

    $scope.locations = locations;

    $scope.editLocation = function (id) {
      $location.path("/location/edit/" + (id || ""));
    };

    $scope.createLocation = function () {
      $scope.editLocation();
    };

    $scope.sort = {
      column: "name",
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
