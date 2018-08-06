angular.module('MCDiligenceApp.Controllers')
    .controller('MCDiligenceReviewCtrl',
        ['$scope', 'mcDiligenceForm', '$uibModal', function ($scope, mcDiligenceForm, $uibModal) {
            $scope.mcDiligenceForm = mcDiligenceForm;
            $scope.latLong = $scope.mcDiligenceForm.coords.slice(
                Math.max($scope.mcDiligenceForm.coords.length - 2, 0));

            $scope.openUnitView = () => {
                console.log('open modal');
                const modalInstance = $uibModal.open({
                    templateUrl: '/lib/public/angular/apps/mcdiligence/views/modals/mcUnitModalView.html',
                    scope:       $scope,
                    controller:  'mcDiligenceModalCtrl',
                });
            };
        }]);
