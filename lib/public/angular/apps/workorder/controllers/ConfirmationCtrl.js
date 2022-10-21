angular.module('WorkOrderApp.Controllers').controller('ConfirmationCtrl',
  function ($scope, $uibModalInstance){
    $scope.confirm = () => {
      $uibModalInstance.close(true);
    };
    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };
  });
