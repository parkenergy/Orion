angular.module('WorkOrderApp.Controllers').controller('JsaEditModalCtrl',
  function ( $scope, $uibModalInstance, jsa, ObjectService ){
    $scope.jsa = jsa;
    
    $scope.changeJsaTextAreaField = (changeData, selected) => {
      ObjectService.updateNestedObjectValue($scope.jsa, changeData, selected);
    };
    
    $scope.changeJsaCheckbox = (changedData, selected) => {
      ObjectService.updateNestedObjectValue($scope.jsa, changedData, selected);
    };
    $scope.changeJsaTextField = (changedData, selected) => {
      ObjectService.updateNonNestedObjectValue($scope.jsa, changedData, selected);
    };
    
    $scope.ok = () => {
      $uibModalInstance.close($scope.jsa);
    };
    $scope.cancel = function (){
      $uibModalInstance.dismiss('cancel');
    };
    $scope.removeTech = (tech) => {
      const index = $scope.jsa.techinicians.indexOf(tech);
      $scope.jsa.techinicians.splice(index, 1);
    };
  });
