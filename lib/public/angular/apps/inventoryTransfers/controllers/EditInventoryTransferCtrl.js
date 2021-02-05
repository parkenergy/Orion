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
        "locations",
        function (
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
            inventorytransfer,
            locations
        ) {
            console.log(arguments);
            // Variables-----------------------------------------
            const ARS = ApiRequestService;
            const DS = DateService;
            $scope.loaded = true;
            $scope.spinner = false;
            $scope.locations = locations;
            // --------------------------------------------------

            $scope.currentInventoryTransfer = inventorytransfer;

            $scope.updatePart = (part, index) => {
                const modalInstance = $uibModal.open({
                    templateUrl:
                        "/lib/public/angular/apps/inventoryTransfers/views/component-views/editPart.html",
                    controller: "EditPartCtrl",
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
                    $scope.currentInventoryTransfer.parts[index].quantity =
                        data.quantity;
                    $scope.currentInventoryTransfer.parts[index].netsuiteId =
                        data.netsuiteId;
                    $scope.currentInventoryTransfer.parts[index].number =
                        data.componentName;
                    $scope.currentInventoryTransfer.parts[index].description =
                        data.description;
                    $scope.currentInventoryTransfer.parts[index].isManual =
                        data.isManual;
                });
            };

            $scope.originChange = () => {
                $scope.currentInventoryTransfer.originLocationNSID = locations.find(
                    (location) =>
                        location._id ===
                        $scope.currentInventoryTransfer.originLocation
                );
            };

            $scope.destinationChange = () => {
                $scope.currentInventoryTransfer.destinationLocationNSID = locations.find(
                    (location) =>
                        location._id ===
                        $scope.currentInventoryTransfer.destinationLocation
                );
            };

            $scope.updateTransfer = () => {
                console.log($scope.currentInventoryTransfer);
                $http
                    .put(
                        "/api/inventorytransfers/" +
                            $scope.currentInventoryTransfer._id,
                        angular.toJson($scope.currentInventoryTransfer)
                    )
                    .then(() => {
                        $location.path("/inventory-transfers");
                    });
            };

            $scope.pushTransfer = () => {
                console.log($scope.currentInventoryTransfer);
                $http
                    .post(
                        "/api/inventorytransfers/" +
                            $scope.currentInventoryTransfer._id +
                            "/push",
                        angular.toJson($scope.currentInventoryTransfer)
                    )
                    .then(() => {
                        $location.path("/inventory-transfers");
                    });
            };
        },
    ]);
