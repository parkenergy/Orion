angular
    .module("InventoryTransfersApp.Controllers")
    .controller("InventoryTransfersCtrl", [
        "$scope",
        "$http",
        "$timeout",
        "$location",
        "$q",
        "$cookies",
        "AlertService",
        "ApiRequestService",
        "DateService",
        function(
            $scope,
            $http,
            $timeout,
            $location,
            $q,
            $cookies,
            AlertService,
            ApiRequestService,
            DateService
        ) {
            // Variables-----------------------------------------
            const ARS = ApiRequestService;
            const DS = DateService;
            $scope.loaded = false;
            $scope.spinner = true;

            $scope.showCompleted = false;
            // --------------------------------------------------

            $scope.waitingInventoryTransfers = [];
            $scope.completedInventoryTransfers = [];

            $http({
                method: "GET",
                url: "http://localhost:8888/transfers/waiting"
            }).then(
                function successCallback(response) {
                    $scope.waitingInventoryTransfers = response.data.map(
                        transfer => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map(transfer => transfer.description)
                                    .join(", ")
                            };
                        }
                    );
                },
                function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }
            );

            $http({
                method: "GET",
                url: "http://localhost:8888/transfers/completed"
            }).then(
                function successCallback(response) {
                    console.log(response.data);

                    $scope.completedInventoryTransfers = response.data.map(
                        transfer => {
                            return {
                                ...transfer,
                                parts: transfer.parts
                                    .map(transfer => transfer.description)
                                    .join(", ")
                            };
                        }
                    );
                    $scope.loaded = true;
                    $scope.spinner = false;
                },
                function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                }
            );

            $scope.getCompletedTransfers = () => {};
        }
    ]);
