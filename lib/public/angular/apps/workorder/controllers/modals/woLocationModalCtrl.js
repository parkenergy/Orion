function geoViewModal($window, $scope, $uibModalInstance, obj) {
    $scope.unit = obj.unit;
    $scope.unit.geo = obj.geo;

    $scope.toUnitPage = () => {
        $uibModalInstance.close();
        $window.open('#/unit/page/' + $scope.unit.geo.coordinates[1]+','+$scope.unit.geo.coordinates[0]);
    };
    $scope.ok = () => {
        $uibModalInstance.close();
    };
}

angular
    .module('WorkOrderApp.Controllers')
    .controller('woLocationModalCtrl',['$window', '$scope', '$uibModalInstance', 'obj', geoViewModal]);
