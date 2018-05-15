angular.module('WorkOrderApp.Controllers').controller('SubmitAllModalCtrl',
    function ($scope, $uibModalInstance) {

        $scope.ok = () => {
            $uibModalInstance.close(true);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss(false);
        };
    });
