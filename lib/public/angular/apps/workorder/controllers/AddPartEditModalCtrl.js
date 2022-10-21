angular.module('WorkOrderApp.Controllers').controller('AddPartEditModalCtrl',
  function ( $scope, $uibModalInstance, ObjectService){
    $scope.part = {};
    
    $scope.changePartTextAreaField = (changedData, selected) => {
      ObjectService.updateNonNestedObjectValue($scope.part, changedData, selected);
    };
    
    $scope.changePartTextField = ( changedData, selected ) => {
      ObjectService.updateNonNestedObjectValue($scope.part, changedData, selected);
    };
    
    $scope.addPart = () => {
      $uibModalInstance.close($scope.part);
    };
    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };
  });
