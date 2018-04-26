angular.module('WorkOrderApp.Controllers').controller('woLocationModalCtrl',['$window', '$scope', '$uibModalInstance',
  function ($window, $scope, $uibModalInstance) {
    $scope.unit = $scope.$parent.displayUnit;
    $scope.unit.geo = $scope.$parent.workorder.geo;

    $scope.toUnitPage = () => {
      console.log('executed')
      $uibModalInstance.close();
      $window.open('#/unit/page/' + $scope.unit.geo.coordinates[1]+','+$scope.unit.geo.coordinates[0]);
    };
    $scope.ok = () => {
      $uibModalInstance.close();
    }
  }]);
