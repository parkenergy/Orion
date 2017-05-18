angular.module('WorkOrderApp.Controllers').controller('woLocationModalCtrl',
  function ($scope, $uibModalInstance) {
    $scope.unit = $scope.$parent.workorder.unit;
    
    $scope.ok = () => {
      $uibModalInstance.close();
    }
  });
