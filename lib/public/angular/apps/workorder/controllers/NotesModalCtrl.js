function NotesModal($scope, $uibModalInstance, obj){
    $scope.notes = obj.notes;
    $scope.disabled = obj.disabled

    $scope.changeNoteTextAreaField = ( changedData, selected ) => {
        $scope.notes = changedData;
    };

    $scope.ok = () => {
        $uibModalInstance.close($scope.notes);
    };
    $scope.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };
}

angular
    .module('WorkOrderApp.Controllers')
    .controller('NotesModalCtrl', NotesModal);
