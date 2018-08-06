angular.module('MCDiligenceApp.Controllers')
    .controller('mcDiligenceModalCtrl', ['$window', '$scope', '$uibModalInstance',
        function ($window, $scope, $uibModalInstance) {
            $scope.unit = {};
            $scope.latLong = $scope.$parent.latLong;
            $scope.unit.geo = {
                type:        'Point',
                coordinates: [$scope.latLong[1], $scope.latLong[0]],
            };

            $scope.toUnitPage = () => {
                $uibModalInstance.close();
                $window.open('#/unit/page/' + $scope.unit.geo.coordinates[1] + ',' +
                    $scope.unit.geo.coordinates[0]);
            };
            $scope.ok = () => {
                $uibModalInstance.close();
            };
        }]);
