angular.module('WorkOrderApp.Controllers').controller('NotesModalCtrl',
  function ( $scope, $uibModalInstance, notes){
    $scope.notes = notes;
    $scope.disabled = $scope.$parent.disabled;
    
    $scope.changeNoteTextAreaField = ( changedData, selected ) => {
      $scope.notes = changedData;
    };
    
    $scope.ok = () => {
      $uibModalInstance.close($scope.notes);
    };
    $scope.cancel = () => {
      $uibModalInstance.dismiss('cancel');
    };
  });
