angular.module('UnitApp.Controllers').controller('UnitIndexCtrl',
['$scope', '$route', '$location', 'AlertService', 'LoaderService', 'units', '$cookies', 'role',
  function ($scope, $route, $location, AlertService, LoaderService, units, $cookies, role) {

    $scope.title = "Units";

    $scope.units = units;
    $scope.userName = $cookies.get('userName');
    $scope.role = role;

    $scope.editUnit = function (id) {
      $location.path("/unit/edit/" + (id || ""));
    };

    $scope.createUnit = function () {
      $scope.editUnit();
    };

    $scope.sort = {
      column: "number",
      descending: false,
    };

    $scope.changeSorting = function (column) {
      if ($scope.sort.column == column) {
        $scope.sort.descending = !$scope.sort.descending;
      } else {
        $scope.sort.column = column;
        $scope.sort.descending = false;
      }
    };

    (function () {
      $scope.allowEdit = false;
      var name = $scope.userName;
      if (name === 'Jonathan Mitchell') {
        $scope.allowEdit = true;
      }
      else if (role === "ADMIN") {
        $scope.allowEdit = true;
      }
    })();

}]);
