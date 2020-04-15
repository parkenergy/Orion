angular.module("InventoryTransfersApp.Controllers").controller("EditPartCtrl", [
    "$scope",
    "$uibModalInstance",
    "$uibModal",
    "partSelected",
    function ($scope, $uibModalInstance, $uibModal, partSelected) {
        $scope.part = partSelected.data;

        $scope.update = () => {
            $uibModalInstance.close({
                data: $scope.part,
                index: partSelected.index,
            });
        };

        $scope.selectPart = (part, index) => {
            const modalInstance = $uibModal.open({
                templateUrl:
                    "/lib/public/angular/apps/inventoryTransfers/views/component-views/partSelection.html",
                controller: "PartSelectionCtrl",
                resolve: {
                    partSelected: function () {
                        return {
                            data: part,
                            index: index,
                        };
                    },
                },
            });

            // Modal Instance Result Calls Parent Function -
            modalInstance.result.then(({ data, index }) => {
                $scope.part.netsuiteId = data.netsuiteId;
                $scope.part.number = data.componentName;
                $scope.part.description = data.description;
                $scope.part.isManual = false;
            });
        };

        $scope.cancel = () => {
            $uibModalInstance.dismiss("cancel");
        };
    },
]);
