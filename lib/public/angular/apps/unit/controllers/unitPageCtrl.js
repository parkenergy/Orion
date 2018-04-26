angular.module('UnitApp.Controllers').controller('UnitPageCtrl',
  ['coords', '$scope',
    function (coords, $scope) {
      $scope.coords = coords;
    }]);
