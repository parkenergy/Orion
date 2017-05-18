angular.module('WorkOrderApp.Controllers').controller('JsaReviewModalCtrl',
  function ( $scope, $uibModalInstance, jsa ){
    $scope.jsa = jsa;
    
    $scope.ok = () => {
      $uibModalInstance.close($scope.jsa);
    };
    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };
  });
