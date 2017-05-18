angular.module('WorkOrderApp.Controllers').controller('ErrorCtrl',
  function ($scope, $uibModalInstance){
    $scope.ok = () => {
      $uibModalInstance.close();
    };
  });
