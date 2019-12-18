angular
    .module("InventoryTransfersApp.Controllers")
    .controller("EditInventoryTransferCtrl", [
        "$scope",
        "$http",
        "$timeout",
        "$location",
        "$q",
        "$cookies",
        "AlertService",
        "InventoryTransfers",
        "ApiRequestService",
        "DateService",
        "$uibModal",
        "inventorytransfer",
        function(
            $scope,
            $http,
            $timeout,
            $location,
            $q,
            $cookies,
            AlertService,
            InventoryTransfers,
            ApiRequestService,
            DateService,
            $uibModal,
            inventorytransfer
        ) {
            console.log(arguments);
            // Variables-----------------------------------------
            const ARS = ApiRequestService;
            const DS = DateService;
            $scope.loaded = true;
            $scope.spinner = false;
            // --------------------------------------------------

            $scope.currentInventoryTransfer = inventorytransfer;

            $scope.selectPart = (part, index) => {
                const modalInstance = $uibModal.open({
                    templateUrl:
                        "/lib/public/angular/apps/inventoryTransfers/views/component-views/partSelection.html",
                    controller: "PartSelectionCtrl",
                    resolve: {
                        partSelected: function() {
                            return {
                                data: part,
                                index: index
                            };
                        }
                    }
                });

                // Modal Instance Result Calls Parent Function -
                modalInstance.result.then(({ data, index }) => {
                    $scope.currentInventoryTransfer.parts[index].netsuiteId =
                        data.netsuiteId;
                    $scope.currentInventoryTransfer.parts[index].number =
                        data.componentName;
                    $scope.currentInventoryTransfer.parts[index].description =
                        data.description;
                    $scope.currentInventoryTransfer.parts[
                        index
                    ].isManual = false;
                });
            };

            $scope.updateTransfer = () => {
                console.log($scope.currentInventoryTransfer);
                $scope.currentInventoryTransfer.$save().$promise.then(() => {
                    $location.path("/inventory-transfers");
                });
            };
        }
    ]);
