angular.module('WorkOrderApp.Controllers').controller('woLocationModalCtrl',
  function ($scope, $uibModalInstance) {
    $scope.unit = $scope.$parent.displayUnit;
    $scope.unit.geo = $scope.$parent.workorder.geo;
    
    $scope.ok = () => {
      $uibModalInstance.close();
    }
  });
